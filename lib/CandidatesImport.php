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
        $data = $this->prepareData($dataNamed);

        $columns = $data['dataColumns'];
        $values = $data['data'];

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
