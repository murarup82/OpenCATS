<?php
/**
 * Reports Settings Library
 *
 * Stores customer dashboard threshold values in the shared settings table.
 */
class ReportsSettings
{
    const SETTING_SLA_ACTIVITY_DAYS = 'customerDashboardSLAActivityDays';
    const SETTING_RISK_NO_ACTIVITY_DAYS = 'customerDashboardRiskNoActivityDays';
    const SETTING_RISK_LONG_OPEN_DAYS = 'customerDashboardRiskLongOpenDays';
    const SETTING_RISK_LOW_COVERAGE_DAYS = 'customerDashboardRiskLowCoverageDays';

    const DEFAULT_SLA_ACTIVITY_DAYS = 5;
    const DEFAULT_RISK_NO_ACTIVITY_DAYS = 10;
    const DEFAULT_RISK_LONG_OPEN_DAYS = 30;
    const DEFAULT_RISK_LOW_COVERAGE_DAYS = 14;

    private $_db;
    private $_siteID;

    public function __construct($siteID)
    {
        $this->_siteID = (int) $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    public function getAll()
    {
        $settings = array(
            self::SETTING_SLA_ACTIVITY_DAYS => self::DEFAULT_SLA_ACTIVITY_DAYS,
            self::SETTING_RISK_NO_ACTIVITY_DAYS => self::DEFAULT_RISK_NO_ACTIVITY_DAYS,
            self::SETTING_RISK_LONG_OPEN_DAYS => self::DEFAULT_RISK_LONG_OPEN_DAYS,
            self::SETTING_RISK_LOW_COVERAGE_DAYS => self::DEFAULT_RISK_LOW_COVERAGE_DAYS
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
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(SETTINGS_REPORTS)
        );
        $rs = $this->_db->getAllAssoc($sql);

        foreach ($rs as $row)
        {
            $settingName = trim((string) $row['setting']);
            if (!array_key_exists($settingName, $settings))
            {
                continue;
            }

            $settings[$settingName] = $this->sanitizeThresholdValue(
                $settingName,
                $row['value']
            );
        }

        return $settings;
    }

    public function set($setting, $value)
    {
        $setting = trim((string) $setting);
        if ($setting === '')
        {
            return;
        }

        $value = $this->sanitizeThresholdValue($setting, $value);

        $sql = sprintf(
            "DELETE FROM
                settings
            WHERE
                settings.setting = %s
            AND
                site_id = %s
            AND
                settings_type = %s",
            $this->_db->makeQueryString($setting),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(SETTINGS_REPORTS)
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
            $this->_db->makeQueryInteger(SETTINGS_REPORTS)
        );
        $this->_db->query($sql);
    }

    public function sanitizeThresholdValue($setting, $value)
    {
        $intValue = (int) $value;
        if ($intValue <= 0)
        {
            $intValue = $this->getDefaultValue($setting);
        }

        switch ($setting)
        {
            case self::SETTING_SLA_ACTIVITY_DAYS:
                return $this->clamp($intValue, 1, 30);

            case self::SETTING_RISK_NO_ACTIVITY_DAYS:
                return $this->clamp($intValue, 2, 60);

            case self::SETTING_RISK_LONG_OPEN_DAYS:
                return $this->clamp($intValue, 5, 180);

            case self::SETTING_RISK_LOW_COVERAGE_DAYS:
                return $this->clamp($intValue, 2, 90);

            default:
                return $intValue;
        }
    }

    private function getDefaultValue($setting)
    {
        switch ($setting)
        {
            case self::SETTING_SLA_ACTIVITY_DAYS:
                return self::DEFAULT_SLA_ACTIVITY_DAYS;

            case self::SETTING_RISK_NO_ACTIVITY_DAYS:
                return self::DEFAULT_RISK_NO_ACTIVITY_DAYS;

            case self::SETTING_RISK_LONG_OPEN_DAYS:
                return self::DEFAULT_RISK_LONG_OPEN_DAYS;

            case self::SETTING_RISK_LOW_COVERAGE_DAYS:
                return self::DEFAULT_RISK_LOW_COVERAGE_DAYS;

            default:
                return 1;
        }
    }

    private function clamp($value, $min, $max)
    {
        if ($value < $min)
        {
            return $min;
        }
        if ($value > $max)
        {
            return $max;
        }

        return $value;
    }
}
?>
