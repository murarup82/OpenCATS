<?php
/**
 * GDPR Settings Library
 *
 * Provides accessors for site-specific GDPR configuration stored in the
 * shared settings table.
 */
class GDPRSettings
{
    private $_db;
    private $_siteID;

    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    /**
     * Returns all GDPR settings for a site.
     *
     * @return array (setting => value)
     */
    public function getAll()
    {
        $settings = array(
            'expirationYears' => '2'
        );

        $sql = sprintf(
            "SELECT
                settings.setting AS setting,
                settings.value AS value
            FROM
                settings
            WHERE
                settings.site_id = %s
            AND
                settings.settings_type = %s",
            $this->_siteID,
            SETTINGS_GDPR
        );
        $rs = $this->_db->getAllAssoc($sql);

        foreach ($rs as $row) {
            if (array_key_exists($row['setting'], $settings)) {
                $settings[$row['setting']] = $row['value'];
            }
        }

        return $settings;
    }

    /**
     * Persists a GDPR setting for a site.
     *
     * @param string $setting
     * @param string $value
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
                settings.site_id = %s
            AND
                settings.settings_type = %s",
            $this->_db->makeQueryStringOrNULL($setting),
            $this->_siteID,
            SETTINGS_GDPR
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
            SETTINGS_GDPR
        );
        $this->_db->query($sql);
    }
}
?>
