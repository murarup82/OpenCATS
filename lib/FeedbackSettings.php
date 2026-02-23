<?php
/**
 * Feedback Settings Library
 *
 * Stores site-level feedback routing settings in the shared settings table.
 */
class FeedbackSettings
{
    const SETTING_RECIPIENT_USER_ID = 'feedbackRecipientUserID';

    private $_db;
    private $_siteID;

    public function __construct($siteID)
    {
        $this->_siteID = (int) $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    /**
     * Returns all feedback settings for a site.
     *
     * @return array (setting => value)
     */
    public function getAll()
    {
        $settings = array(
            self::SETTING_RECIPIENT_USER_ID => '0'
        );

        $sql = sprintf(
            "SELECT
                settings.setting AS setting,
                settings.value AS value
             FROM
                settings
             WHERE
                settings.site_id = %s
                AND settings.settings_type = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(SETTINGS_FEEDBACK)
        );
        $rs = $this->_db->getAllAssoc($sql);

        foreach ($rs as $row)
        {
            $settingName = trim((string) $row['setting']);
            if ($settingName === self::SETTING_RECIPIENT_USER_ID)
            {
                $settings[self::SETTING_RECIPIENT_USER_ID] = (string) ((int) $row['value']);
            }
        }

        return $settings;
    }

    /**
     * Returns the configured feedback recipient user ID.
     *
     * @return int
     */
    public function getRecipientUserID()
    {
        $settings = $this->getAll();
        return (int) $settings[self::SETTING_RECIPIENT_USER_ID];
    }

    /**
     * Persists one feedback setting for a site.
     *
     * @param string $setting
     * @param string $value
     * @return void
     */
    public function set($setting, $value)
    {
        $setting = trim((string) $setting);
        if ($setting === '')
        {
            return;
        }

        $sql = sprintf(
            "DELETE FROM
                settings
             WHERE
                settings.setting = %s
                AND site_id = %s
                AND settings_type = %s",
            $this->_db->makeQueryString($setting),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(SETTINGS_FEEDBACK)
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "INSERT INTO settings (
                setting,
                value,
                site_id,
                settings_type
            ) VALUES (
                %s,
                %s,
                %s,
                %s
            )",
            $this->_db->makeQueryString($setting),
            $this->_db->makeQueryString((string) $value),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(SETTINGS_FEEDBACK)
        );
        $this->_db->query($sql);
    }

    /**
     * Saves feedback recipient user ID.
     *
     * @param int $userID
     * @return void
     */
    public function setRecipientUserID($userID)
    {
        $this->set(self::SETTING_RECIPIENT_USER_ID, (string) ((int) $userID));
    }
}
?>
