<?php
/**
 * GDPR Settings Library
 *
 * Provides accessors for site-specific GDPR configuration stored in the
 * shared settings table and ensures required schema elements exist.
 */
class GDPRSettings
{
    const SETTING_KEY = 'gdprExpirationYears';

    private static $_schemaChecked = false;

    private $_db;
    private $_siteID;

    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
        self::ensureSchema();
    }

    /**
     * Make sure the database has the columns we rely on.
     *
     * @return void
     */
    public static function ensureSchema()
    {
        if (self::$_schemaChecked) {
            return;
        }

        $db = DatabaseConnection::getInstance();

        $columnCheck = $db->getAllAssoc("SHOW COLUMNS FROM candidate LIKE 'gdpr_signed'");
        if (empty($columnCheck)) {
            $db->query(
                "ALTER TABLE candidate
                    ADD COLUMN gdpr_signed int(1) NOT NULL DEFAULT '0' AFTER best_time_to_call"
            );
        }

        $columnCheck = $db->getAllAssoc("SHOW COLUMNS FROM candidate LIKE 'gdpr_expiration_date'");
        if (empty($columnCheck)) {
            $db->query(
                "ALTER TABLE candidate
                    ADD COLUMN gdpr_expiration_date date DEFAULT NULL AFTER gdpr_signed"
            );
        }

        self::$_schemaChecked = true;
    }

    /**
     * Returns all GDPR settings for a site.
     *
     * @return array (setting => value)
     */
    public function getAll()
    {
        $settings = array(
            self::SETTING_KEY => '2'
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

        $hasExpirationSetting = false;

        foreach ($rs as $row) {
            if ($row['setting'] == self::SETTING_KEY) {
                $settings[self::SETTING_KEY] = $row['value'];
                $hasExpirationSetting = true;
            }
        }

        if (!$hasExpirationSetting) {
            $this->set(self::SETTING_KEY, $settings[self::SETTING_KEY]);
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
        if ($setting === 'expirationYears') {
            $setting = self::SETTING_KEY;
        }

        self::ensureSchema();

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
