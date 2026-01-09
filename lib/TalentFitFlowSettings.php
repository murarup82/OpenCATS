<?php
/**
 * CATS
 * TalentFitFlow Settings Library
 */

class TalentFitFlowSettings
{
    private $_db;
    private $_siteID;


    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    /**
     * Returns all TalentFitFlow settings for a site.
     *
     * @return array (setting => value)
     */
    public function getAll()
    {
        $settings = array(
            'baseUrl' => '',
            'apiKey' => '',
            'hmacSecret' => ''
        );

        $sql = sprintf(
            "SELECT
                settings.setting AS setting,
                settings.value AS value,
                settings.site_id AS siteID
            FROM
                settings
            WHERE
                settings.site_id = %s
            AND
                settings.settings_type = %s",
            $this->_siteID,
            SETTINGS_TALENTFITFLOW
        );
        $rs = $this->_db->getAllAssoc($sql);

        foreach ($rs as $row)
        {
            if (array_key_exists($row['setting'], $settings))
            {
                $settings[$row['setting']] = $row['value'];
            }
        }

        return $settings;
    }

    /**
     * Sets a TalentFitFlow setting for a site.
     *
     * @param string Setting name.
     * @param string Setting value.
     * @return void
     */
    public function set($setting, $value)
    {
        $sql = sprintf(
            "DELETE FROM
                settings
            WHERE
                settings.setting = %s
            AND
                site_id = %s
            AND
                settings_type = %s",
            $this->_db->makeQueryStringOrNULL($setting),
            $this->_siteID,
            SETTINGS_TALENTFITFLOW
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "INSERT INTO settings (
                setting,
                value,
                site_id,
                settings_type
            )
            VALUES (
                %s,
                %s,
                %s,
                %s
            )",
            $this->_db->makeQueryStringOrNULL($setting),
            $this->_db->makeQueryStringOrNULL($value),
            $this->_siteID,
            SETTINGS_TALENTFITFLOW
         );
         $this->_db->query($sql);
    }
}

?>
