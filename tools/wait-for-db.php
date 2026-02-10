<?php
/*
 * Wait for DB connectivity.
 * Usage: php tools/wait-for-db.php [--timeout=60] [--interval=2]
 */

$root = realpath(__DIR__ . '/..');
if ($root === false)
{
    fwrite(STDERR, "Unable to resolve project root.\n");
    exit(1);
}

chdir($root);
require_once($root . '/config.php');

$timeout = 60;
$interval = 2;
foreach ($argv as $arg)
{
    if (strpos($arg, '--timeout=') === 0)
    {
        $timeout = (int) substr($arg, strlen('--timeout='));
    }
    else if (strpos($arg, '--interval=') === 0)
    {
        $interval = (int) substr($arg, strlen('--interval='));
    }
}

if ($timeout <= 0)
{
    $timeout = 60;
}
if ($interval <= 0)
{
    $interval = 2;
}

$start = time();
do
{
    $conn = @mysqli_connect(DATABASE_HOST, DATABASE_USER, DATABASE_PASS);
    if ($conn)
    {
        $dbSelected = @mysqli_select_db($conn, DATABASE_NAME);
        @mysqli_close($conn);
        if ($dbSelected)
        {
            fwrite(STDOUT, "DB is available.\n");
            exit(0);
        }
    }

    if ((time() - $start) >= $timeout)
    {
        fwrite(STDERR, "Timed out waiting for DB connectivity.\n");
        exit(1);
    }

    sleep($interval);
} while (true);

