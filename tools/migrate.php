<?php
/*
 * OpenCATS Migration Runner (idempotent)
 * Usage: php tools/migrate.php [--dry-run]
 */

$root = realpath(__DIR__ . '/..');
if ($root === false)
{
    fwrite(STDERR, "Unable to resolve project root.\n");
    exit(1);
}

chdir($root);

require_once($root . '/config.php');
require_once(LEGACY_ROOT . '/constants.php');
require_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');

$dryRun = in_array('--dry-run', $argv, true);
$migrationsDir = $root . '/migrations';
$lockName = 'opencats_migrate';
$appliedBy = 'docker-startup';

if (!is_dir($migrationsDir))
{
    fwrite(STDOUT, "No migrations directory found. Skipping.\n");
    exit(0);
}

$db = DatabaseConnection::getInstance();

$lockRS = $db->getAssoc(sprintf(
    "SELECT GET_LOCK(%s, %s) AS gotLock",
    $db->makeQueryString($lockName),
    $db->makeQueryInteger(60)
));

if (empty($lockRS) || (int) $lockRS['gotLock'] !== 1)
{
    fwrite(STDERR, "Failed to acquire migration lock.\n");
    exit(1);
}

function migrateQuery($db, $sql)
{
    $result = $db->query($sql, true);
    if ($result === false)
    {
        $error = $db->getError();
        fwrite(STDERR, "Migration query failed: " . $error . "\nSQL: " . $sql . "\n");
        exit(1);
    }
    return $result;
}

// Ensure schema_migrations table exists.
migrateQuery($db, sprintf(
    "CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT(11) NOT NULL AUTO_INCREMENT,
        version VARCHAR(255) NOT NULL,
        checksum CHAR(64) DEFAULT NULL,
        applied_at DATETIME NOT NULL,
        applied_by VARCHAR(64) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_version (version)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci"
));

$applied = array();
$rs = $db->getAllAssoc("SELECT version, checksum FROM schema_migrations");
foreach ($rs as $row)
{
    $applied[$row['version']] = $row['checksum'];
}

$files = glob($migrationsDir . '/*.sql');
sort($files, SORT_STRING);

$pending = array();
foreach ($files as $file)
{
    $version = basename($file);
    $checksum = hash_file('sha256', $file);
    if (isset($applied[$version]))
    {
        if (!empty($applied[$version]) && $applied[$version] !== $checksum)
        {
            fwrite(STDERR, "Checksum mismatch for applied migration: {$version}\n");
            exit(1);
        }
        continue;
    }
    $pending[] = array('file' => $file, 'version' => $version, 'checksum' => $checksum);
}

if ($dryRun)
{
    if (empty($pending))
    {
        fwrite(STDOUT, "No pending migrations.\n");
    }
    else
    {
        fwrite(STDOUT, "Pending migrations:\n");
        foreach ($pending as $m)
        {
            fwrite(STDOUT, " - " . $m['version'] . "\n");
        }
    }
    $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString($lockName)));
    exit(0);
}

if (empty($pending))
{
    fwrite(STDOUT, "No pending migrations.\n");
    $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString($lockName)));
    exit(0);
}

function splitSqlStatements($sql)
{
    $statements = array();
    $buffer = '';
    $inString = false;
    $stringChar = '';
    $len = strlen($sql);
    for ($i = 0; $i < $len; $i++)
    {
        $ch = $sql[$i];
        if ($inString)
        {
            if ($ch === $stringChar && ($i === 0 || $sql[$i - 1] !== '\\'))
            {
                $inString = false;
            }
            $buffer .= $ch;
            continue;
        }

        if ($ch === '\'' || $ch === '"')
        {
            $inString = true;
            $stringChar = $ch;
            $buffer .= $ch;
            continue;
        }

        if ($ch === ';')
        {
            $statements[] = $buffer;
            $buffer = '';
            continue;
        }

        $buffer .= $ch;
    }

    if (trim($buffer) !== '')
    {
        $statements[] = $buffer;
    }

    return $statements;
}

foreach ($pending as $migration)
{
    $version = $migration['version'];
    $file = $migration['file'];
    $checksum = $migration['checksum'];

    fwrite(STDOUT, "Applying {$version}...\n");
    $sql = file_get_contents($file);
    if ($sql === false)
    {
        fwrite(STDERR, "Failed to read migration file: {$version}\n");
        exit(1);
    }

    $statements = splitSqlStatements($sql);
    foreach ($statements as $statement)
    {
        $statement = trim($statement);
        if ($statement === '' || $statement === '--' || $statement === '#')
        {
            continue;
        }
        migrateQuery($db, $statement);
    }

    migrateQuery($db, sprintf(
        "INSERT INTO schema_migrations (version, checksum, applied_at, applied_by)
        VALUES (%s, %s, NOW(), %s)",
        $db->makeQueryString($version),
        $db->makeQueryString($checksum),
        $db->makeQueryString($appliedBy)
    ));

    fwrite(STDOUT, "Applied {$version}.\n");
}

$db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString($lockName)));
fwrite(STDOUT, "Migrations complete.\n");
exit(0);

