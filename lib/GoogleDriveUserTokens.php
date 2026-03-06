<?php
/**
 * Google Drive per-user token storage.
 *
 * Stores encrypted OAuth tokens required for Drive upload flows.
 */
class GoogleDriveUserTokens
{
    const TABLE_NAME = 'google_drive_user_tokens';

    private $_db;
    private static $_tableEnsured = false;

    public function __construct()
    {
        $this->_db = DatabaseConnection::getInstance();
    }

    public function get($siteID, $userID)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        if ($siteID <= 0 || $userID <= 0)
        {
            return array();
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "SELECT
                site_id AS siteID,
                user_id AS userID,
                google_sub AS googleSub,
                google_email AS googleEmail,
                access_token AS accessTokenEncrypted,
                refresh_token AS refreshTokenEncrypted,
                token_type AS tokenType,
                token_scope AS tokenScope,
                expires_at AS expiresAt
            FROM
                %s
            WHERE
                site_id = %s
            AND
                user_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID)
        );
        $row = $this->_db->getAssoc($sql);
        if (empty($row))
        {
            return array();
        }

        return array(
            'siteID' => (int) $row['siteID'],
            'userID' => (int) $row['userID'],
            'googleSub' => (string) $row['googleSub'],
            'googleEmail' => (string) $row['googleEmail'],
            'accessToken' => $this->decryptToken((string) $row['accessTokenEncrypted']),
            'refreshToken' => $this->decryptToken((string) $row['refreshTokenEncrypted']),
            'tokenType' => (string) $row['tokenType'],
            'tokenScope' => (string) $row['tokenScope'],
            'expiresAt' => (string) $row['expiresAt']
        );
    }

    public function save($siteID, $userID, $payload)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        if ($siteID <= 0 || $userID <= 0)
        {
            return false;
        }

        $this->ensureTableExists();

        $googleSub = (isset($payload['googleSub']) ? trim((string) $payload['googleSub']) : '');
        $googleEmail = (isset($payload['googleEmail']) ? trim((string) $payload['googleEmail']) : '');
        $accessToken = (isset($payload['accessToken']) ? trim((string) $payload['accessToken']) : '');
        $refreshToken = (isset($payload['refreshToken']) ? trim((string) $payload['refreshToken']) : '');
        $tokenType = (isset($payload['tokenType']) ? trim((string) $payload['tokenType']) : '');
        $tokenScope = (isset($payload['tokenScope']) ? trim((string) $payload['tokenScope']) : '');
        $expiresAt = (isset($payload['expiresAt']) ? trim((string) $payload['expiresAt']) : '');

        $encryptedAccessToken = $this->encryptToken($accessToken);
        $encryptedRefreshToken = $this->encryptToken($refreshToken);

        $expiresAtSQL = ($expiresAt !== '')
            ? $this->_db->makeQueryString($expiresAt)
            : 'NULL';

        $sql = sprintf(
            "INSERT INTO %s (
                site_id,
                user_id,
                google_sub,
                google_email,
                access_token,
                refresh_token,
                token_type,
                token_scope,
                expires_at,
                created_at,
                updated_at
            ) VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                NOW(),
                NOW()
            )
            ON DUPLICATE KEY UPDATE
                google_sub = VALUES(google_sub),
                google_email = VALUES(google_email),
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                token_type = VALUES(token_type),
                token_scope = VALUES(token_scope),
                expires_at = VALUES(expires_at),
                updated_at = NOW()",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryString($googleSub),
            $this->_db->makeQueryString($googleEmail),
            $this->_db->makeQueryString($encryptedAccessToken),
            $this->_db->makeQueryString($encryptedRefreshToken),
            $this->_db->makeQueryString($tokenType),
            $this->_db->makeQueryString($tokenScope),
            $expiresAtSQL
        );

        return (bool) $this->_db->query($sql);
    }

    public function clear($siteID, $userID)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        if ($siteID <= 0 || $userID <= 0)
        {
            return false;
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "DELETE FROM
                %s
            WHERE
                site_id = %s
            AND
                user_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID)
        );

        return (bool) $this->_db->query($sql);
    }

    private function ensureTableExists()
    {
        if (self::$_tableEnsured)
        {
            return;
        }

        $sql = sprintf(
            "CREATE TABLE IF NOT EXISTS %s (
                site_id int(11) NOT NULL,
                user_id int(11) NOT NULL,
                google_sub varchar(191) NOT NULL DEFAULT '',
                google_email varchar(191) NOT NULL DEFAULT '',
                access_token text,
                refresh_token text,
                token_type varchar(32) NOT NULL DEFAULT '',
                token_scope text,
                expires_at datetime DEFAULT NULL,
                created_at datetime NOT NULL,
                updated_at datetime NOT NULL,
                PRIMARY KEY (site_id, user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8",
            self::TABLE_NAME
        );
        $this->_db->query($sql);

        self::$_tableEnsured = true;
    }

    private function getEncryptionKey()
    {
        $seed = (defined('DATABASE_PASS') ? (string) DATABASE_PASS : '');
        if ($seed === '')
        {
            $seed = 'open-cats-google-drive-token';
        }

        return hash('sha256', $seed . '|google-drive-user-token', true);
    }

    private function encryptToken($plainToken)
    {
        $plainToken = (string) $plainToken;
        if ($plainToken === '')
        {
            return '';
        }

        if (function_exists('openssl_encrypt'))
        {
            $iv = '';
            if (function_exists('random_bytes'))
            {
                $iv = random_bytes(16);
            }
            else if (function_exists('openssl_random_pseudo_bytes'))
            {
                $iv = openssl_random_pseudo_bytes(16);
            }

            if ($iv !== '' && strlen($iv) === 16)
            {
                $encrypted = openssl_encrypt(
                    $plainToken,
                    'AES-256-CBC',
                    $this->getEncryptionKey(),
                    OPENSSL_RAW_DATA,
                    $iv
                );
                if ($encrypted !== false)
                {
                    return 'v1:' . base64_encode($iv . $encrypted);
                }
            }
        }

        return 'plain:' . base64_encode($plainToken);
    }

    private function decryptToken($storedToken)
    {
        $storedToken = (string) $storedToken;
        if ($storedToken === '')
        {
            return '';
        }

        if (strpos($storedToken, 'v1:') === 0)
        {
            $raw = base64_decode(substr($storedToken, 3), true);
            if ($raw === false || strlen($raw) <= 16)
            {
                return '';
            }
            $iv = substr($raw, 0, 16);
            $cipherText = substr($raw, 16);
            $decrypted = openssl_decrypt(
                $cipherText,
                'AES-256-CBC',
                $this->getEncryptionKey(),
                OPENSSL_RAW_DATA,
                $iv
            );
            return ($decrypted === false ? '' : (string) $decrypted);
        }

        if (strpos($storedToken, 'plain:') === 0)
        {
            $decoded = base64_decode(substr($storedToken, 6), true);
            return ($decoded === false ? '' : (string) $decoded);
        }

        return '';
    }
}

