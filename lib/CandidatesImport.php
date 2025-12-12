<?php

include_once(LEGACY_ROOT . '/lib/ImportableEntity.php');

class CandidatesImport extends ImportableEntity
{
    public function __construct($siteID)
    {
        parent::__construct($siteID);
    }

    /**
     * Adds a record to the candidates table.
     *
     * @param array (field => value)
     * @param userID
     * @param importID
     * @return int candidateID
     */
    public function add($dataNamed, $userID, $importID)
    {
        $booleanDefaults = array(
            'can_relocate' => 0,
            'is_hot' => 0,
            'is_active' => 1,
            'gdpr_signed' => 0
        );

        foreach ($booleanDefaults as $field => $defaultValue) {
            if (!array_key_exists($field, $dataNamed)) {
                $dataNamed[$field] = $defaultValue;
                continue;
            }

            $value = $dataNamed[$field];

            if (is_bool($value)) {
                $dataNamed[$field] = $value ? 1 : 0;
                continue;
            }

            if (is_numeric($value)) {
                $dataNamed[$field] = ((int)$value) ? 1 : 0;
                continue;
            }

            $stringValue = strtolower(trim((string)$value));
            if ($stringValue === '') {
                $dataNamed[$field] = $defaultValue;
                continue;
            }

            $truthy = array('yes', 'y', 'true', 't', '1');
            $dataNamed[$field] = in_array($stringValue, $truthy, true) ? 1 : 0;
        }

        $columns = array();
        $values = array();

        foreach ($dataNamed as $column => $value) {
            $columns[] = $column;

            if (array_key_exists($column, $booleanDefaults)) {
                $values[] = $this->_db->makeQueryInteger($value);
                continue;
            }

            /* Treat explicit empty strings as NULL; otherwise quote the value. */
            if (is_string($value)) {
                $value = trim($value);
            }

            if ($value === '' || $value === null) {
                $values[] = 'NULL';
            } else {
                $values[] = $this->_db->makeQueryString($value);
            }
        }

        if (!in_array('can_relocate', $columns, true)) {
            $columns[] = 'can_relocate';
            $values[] = $this->_db->makeQueryInteger(0);
        }

        $columns[] = 'entered_by';
        $values[] = $this->_db->makeQueryInteger($userID);

        $columns[] = 'owner';
        $values[] = $this->_db->makeQueryInteger($userID);

        $columns[] = 'site_id';
        $values[] = $this->_db->makeQueryInteger($this->_siteID);

        $columns[] = 'date_created';
        $values[] = 'NOW()';

        $columns[] = 'date_modified';
        $values[] = 'NOW()';

        $columns[] = 'import_id';
        $values[] = $this->_db->makeQueryInteger($importID);

        $sql = sprintf(
            "INSERT INTO candidate (
                %s
            )
            VALUES (
                %s
            )",
            implode(",\n", $columns),
            implode(",\n", $values)
        );
        $queryResult = $this->_db->query($sql);
        if (!$queryResult)
        {
            return -1;
        }

        return $this->_db->getLastInsertID();
    }
}
