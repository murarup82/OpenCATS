<?php
/**
 * Google OIDC Settings Library
 *
 * Stores Google SSO and access request settings in the shared settings table.
 */
class GoogleOIDCSettings
{
    private $_db;
    private $_siteID;


    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    /**
     * Returns all Google OIDC settings for a site.
     *
     * @return array (setting => value)
     */
    public function getAll()
    {
        $settings = array(
            'enabled' => (defined('GOOGLE_OIDC_ENABLED') && GOOGLE_OIDC_ENABLED) ? '1' : '0',
            'clientId' => (defined('GOOGLE_OIDC_CLIENT_ID') ? (string) GOOGLE_OIDC_CLIENT_ID : ''),
            'clientSecret' => (defined('GOOGLE_OIDC_CLIENT_SECRET') ? (string) GOOGLE_OIDC_CLIENT_SECRET : ''),
            'redirectUri' => (defined('GOOGLE_OIDC_REDIRECT_URI') ? (string) GOOGLE_OIDC_REDIRECT_URI : ''),
            'hostedDomain' => (defined('GOOGLE_OIDC_HOSTED_DOMAIN') ? (string) GOOGLE_OIDC_HOSTED_DOMAIN : ''),
            'siteId' => (defined('GOOGLE_OIDC_SITE_ID') ? (string) GOOGLE_OIDC_SITE_ID : ''),
            'autoProvisionEnabled' => (!defined('GOOGLE_AUTO_PROVISION_ENABLED') || GOOGLE_AUTO_PROVISION_ENABLED) ? '1' : '0',
            'notifyEmail' => (defined('GOOGLE_ACCESS_REQUEST_NOTIFY_EMAIL') ? (string) GOOGLE_ACCESS_REQUEST_NOTIFY_EMAIL : ''),
            'fromEmail' => (defined('GOOGLE_ACCESS_REQUEST_FROM_EMAIL') ? (string) GOOGLE_ACCESS_REQUEST_FROM_EMAIL : ''),
            'requestSubject' => (defined('GOOGLE_ACCESS_REQUEST_SUBJECT') ? (string) GOOGLE_ACCESS_REQUEST_SUBJECT : '')
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
            SETTINGS_GOOGLE_OIDC
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
     * Persists a Google OIDC setting for a site.
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
                site_id = %s
            AND
                settings_type = %s",
            $this->_db->makeQueryStringOrNULL($setting),
            $this->_siteID,
            SETTINGS_GOOGLE_OIDC
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
            SETTINGS_GOOGLE_OIDC
        );
        $this->_db->query($sql);
    }
}
?>
