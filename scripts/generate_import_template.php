<?php
// Usage: php scripts/generate_import_template.php [site_id] [output.csv]
// Defaults: site_id = 1, output.csv = import_template.csv

require_once(__DIR__ . '/../config.php');
require_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
require_once(LEGACY_ROOT . '/lib/ExtraFields.php');

$siteID = isset($argv[1]) && is_numeric($argv[1]) ? (int)$argv[1] : 1;
$outFile = isset($argv[2]) ? $argv[2] : 'import_template.csv';

$db = DatabaseConnection::getInstance();

// Get current candidate table columns
$cols = $db->getAllAssoc('SHOW COLUMNS FROM candidate');
$columns = array();
foreach ($cols as $c) {
    $columns[] = $c['Field'];
}

// Known human-friendly headers that the importer recognizes (label => db_column)
$recognized = array(
    'Full Name' => 'name',
    'First Name' => 'first_name',
    'Last Name' => 'last_name',
    'Address' => 'address',
    'City' => 'city',
    'Country' => 'country',
    'Country/Province' => 'country',
    'Cell Phone' => 'phone_cell',
    'Email' => 'email1',
    'Current Employer' => 'current_employer',
    'Key Skills' => 'key_skills',
    'Notes' => 'notes',
    'Source' => 'source',
    'Date Available' => 'date_available',
    'Can Relocate' => 'can_relocate',
    'Is Hot' => 'is_hot',
    'Desired Pay' => 'desired_pay',
    'Current Pay' => 'current_pay',
    'Is Active' => 'is_active',
    'Best Time To Call' => 'best_time_to_call',
    'gdpr_signed' => 'gdpr_signed',
    'gdpr_expiration_date' => 'gdpr_expiration_date'
);

// Start with recognized headers (human labels) if the corresponding DB column exists
$headers = array();
foreach ($recognized as $label => $dbcol) {
    if (in_array($dbcol, $columns)) {
        $headers[] = $label; // importer accepts the human label
    }
}

// Add any remaining direct DB columns that are useful but not system fields
$skip = array('candidate_id', 'site_id', 'entered_by', 'owner', 'date_created', 'date_modified', 'import_id');
foreach ($columns as $col) {
    if (in_array($col, $skip)) continue;
    // If already included (mapped), skip
    if (in_array($col, $recognized)) continue;
    // If already included by label mapping, skip
    $already = false;
    foreach ($recognized as $label => $dbcol) {
        if ($dbcol == $col) {
            $already = true;
            break;
        }
    }
    if ($already) continue;
    // Add the DB column name as header so it can be used directly
    $headers[] = $col;
}

// Fetch extra fields for candidates and append them (exact field names expected)
$extra = new ExtraFields($siteID, DATA_ITEM_CANDIDATE);
$extraSettings = $extra->getSettings();
foreach ($extraSettings as $e) {
    // fieldName is the exact extra-field name used in importer UI
    $headers[] = $e['fieldName'];
}

// Remove duplicates while preserving order
$seen = array();
$final = array();
foreach ($headers as $h) {
    if (!isset($seen[$h])) {
        $final[] = $h;
        $seen[$h] = true;
    }
}

// Write CSV header
$fp = fopen($outFile, 'w');
if (!$fp) {
    echo "Failed to open output file: $outFile\n";
    exit(1);
}

fputcsv($fp, $final);
fclose($fp);

echo "Generated import template: $outFile\n";
echo "Headers included (first 50 shown):\n";
foreach (array_slice($final, 0, 50) as $h) {
    echo " - $h\n";
}

if (count($final) > 50) echo "... (total " . count($final) . " columns)\n";
