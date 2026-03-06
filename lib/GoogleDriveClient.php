<?php
/**
 * Google Drive client for uploading transformed CV attachments.
 */
class GoogleDriveClient
{
    private $_settings;
    private $_tokenStore;
    private $_siteID;
    private $_userID;
    private $_lastErrorCode;
    private $_lastErrorMessage;

    public function __construct($googleSettings, GoogleDriveUserTokens $tokenStore, $siteID, $userID)
    {
        $this->_settings = $googleSettings;
        $this->_tokenStore = $tokenStore;
        $this->_siteID = (int) $siteID;
        $this->_userID = (int) $userID;
        $this->_lastErrorCode = '';
        $this->_lastErrorMessage = '';
    }

    public function getLastErrorCode()
    {
        return $this->_lastErrorCode;
    }

    public function getLastErrorMessage()
    {
        return $this->_lastErrorMessage;
    }

    public function uploadDocxToFormattedCVFolder($attachmentPath, $attachmentFilename)
    {
        $attachmentPath = (string) $attachmentPath;
        $attachmentFilename = trim((string) $attachmentFilename);
        if ($attachmentPath === '' || !@file_exists($attachmentPath))
        {
            $this->setError('attachmentMissing', 'Attachment file could not be found on server.');
            return false;
        }

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === '')
        {
            return false;
        }

        $targetFolderID = $this->ensureNestedFolder($accessToken, 'root', 'ATS');
        if ($targetFolderID === '')
        {
            return false;
        }

        $targetFolderID = $this->ensureNestedFolder($accessToken, $targetFolderID, 'Formated CV');
        if ($targetFolderID === '')
        {
            return false;
        }

        $uploadPayload = $this->uploadAndConvertDocx(
            $accessToken,
            $attachmentPath,
            $attachmentFilename,
            $targetFolderID
        );
        if (empty($uploadPayload))
        {
            return false;
        }

        return array(
            'fileID' => (isset($uploadPayload['id']) ? (string) $uploadPayload['id'] : ''),
            'fileName' => (isset($uploadPayload['name']) ? (string) $uploadPayload['name'] : $attachmentFilename),
            'editURL' => (isset($uploadPayload['webViewLink']) ? (string) $uploadPayload['webViewLink'] : '')
        );
    }

    private function getValidAccessToken()
    {
        $stored = $this->_tokenStore->get($this->_siteID, $this->_userID);
        if (empty($stored) || empty($stored['refreshToken']))
        {
            $this->setError('googleDriveAuthRequired', 'Google Drive is not connected for this user.');
            return '';
        }

        $accessToken = (isset($stored['accessToken']) ? trim((string) $stored['accessToken']) : '');
        $expiresAt = (isset($stored['expiresAt']) ? trim((string) $stored['expiresAt']) : '');
        $expiresTimestamp = ($expiresAt !== '' ? strtotime($expiresAt) : false);
        $tokenStillValid = ($accessToken !== '' && $expiresTimestamp !== false && $expiresTimestamp > (time() + 60));
        if ($tokenStillValid)
        {
            return $accessToken;
        }

        $tokenPayload = $this->refreshAccessToken((string) $stored['refreshToken']);
        if (empty($tokenPayload))
        {
            return '';
        }

        $nextAccessToken = (isset($tokenPayload['access_token']) ? trim((string) $tokenPayload['access_token']) : '');
        if ($nextAccessToken === '')
        {
            $this->setError('googleDriveRefreshFailed', 'Google Drive token refresh returned no access token.');
            return '';
        }

        $expiresIn = (isset($tokenPayload['expires_in']) ? (int) $tokenPayload['expires_in'] : 0);
        $nextExpiresAt = '';
        if ($expiresIn > 0)
        {
            $nextExpiresAt = date('Y-m-d H:i:s', time() + $expiresIn);
        }

        $this->_tokenStore->save($this->_siteID, $this->_userID, array(
            'googleSub' => (isset($stored['googleSub']) ? (string) $stored['googleSub'] : ''),
            'googleEmail' => (isset($stored['googleEmail']) ? (string) $stored['googleEmail'] : ''),
            'accessToken' => $nextAccessToken,
            'refreshToken' => (string) $stored['refreshToken'],
            'tokenType' => (isset($tokenPayload['token_type']) ? (string) $tokenPayload['token_type'] : (isset($stored['tokenType']) ? (string) $stored['tokenType'] : '')),
            'tokenScope' => (isset($tokenPayload['scope']) ? (string) $tokenPayload['scope'] : (isset($stored['tokenScope']) ? (string) $stored['tokenScope'] : '')),
            'expiresAt' => $nextExpiresAt
        ));

        return $nextAccessToken;
    }

    private function refreshAccessToken($refreshToken)
    {
        $response = $this->httpRequest(
            'https://oauth2.googleapis.com/token',
            'POST',
            array(
                'client_id' => (isset($this->_settings['clientId']) ? (string) $this->_settings['clientId'] : ''),
                'client_secret' => (isset($this->_settings['clientSecret']) ? (string) $this->_settings['clientSecret'] : ''),
                'refresh_token' => (string) $refreshToken,
                'grant_type' => 'refresh_token'
            ),
            array(
                'Accept: application/json',
                'Content-Type: application/x-www-form-urlencoded'
            )
        );

        if (!$response['ok'])
        {
            $providerDetails = $this->parseProviderErrorDetails((string) $response['body']);
            $providerError = (isset($providerDetails['error']) ? (string) $providerDetails['error'] : '');

            if ($providerError === 'invalid_grant')
            {
                $this->_tokenStore->clear($this->_siteID, $this->_userID);
                $this->setError('googleDriveAuthRequired', 'Google Drive connection expired. Reconnect and retry.');
                return array();
            }

            if ($this->isDriveApiDisabledError($providerDetails))
            {
                $this->setError(
                    'googleDriveApiDisabled',
                    'Google Drive API appears disabled in Google Cloud. Enable it for this project and retry.'
                );
                return array();
            }

            $message = $this->buildProviderErrorMessage(
                'Google Drive token refresh failed.',
                $response['statusCode'],
                $providerDetails
            );
            $this->setError('googleDriveRefreshFailed', $message);
            return array();
        }

        $payload = json_decode((string) $response['body'], true);
        if (!is_array($payload))
        {
            $this->setError('googleDriveRefreshFailed', 'Invalid Google token response.');
            return array();
        }

        return $payload;
    }

    private function ensureNestedFolder($accessToken, $parentID, $folderName)
    {
        $existingFolderID = $this->findFolder($accessToken, $parentID, $folderName);
        if ($existingFolderID !== '')
        {
            return $existingFolderID;
        }

        return $this->createFolder($accessToken, $parentID, $folderName);
    }

    private function findFolder($accessToken, $parentID, $folderName)
    {
        $parentID = trim((string) $parentID);
        if ($parentID === '')
        {
            $parentID = 'root';
        }

        $escapedFolderName = str_replace("'", "\\'", trim((string) $folderName));
        $q = "mimeType='application/vnd.google-apps.folder' and trashed=false and name='" .
            $escapedFolderName .
            "' and '" .
            str_replace("'", "\\'", $parentID) .
            "' in parents";
        $url = 'https://www.googleapis.com/drive/v3/files?'
            . 'q=' . rawurlencode($q)
            . '&fields=' . rawurlencode('files(id,name)')
            . '&spaces=drive'
            . '&pageSize=10';

        $response = $this->httpRequest(
            $url,
            'GET',
            array(),
            array(
                'Accept: application/json',
                'Authorization: Bearer ' . $accessToken
            )
        );

        if (!$response['ok'])
        {
            $providerDetails = $this->parseProviderErrorDetails((string) $response['body']);
            if ($this->isDriveApiDisabledError($providerDetails))
            {
                $this->setError(
                    'googleDriveApiDisabled',
                    'Google Drive API appears disabled in Google Cloud. Enable it for this project and retry.'
                );
                return '';
            }

            $message = $this->buildProviderErrorMessage(
                'Unable to query Google Drive folders.',
                $response['statusCode'],
                $providerDetails
            );
            $this->setError('googleDriveFolderLookupFailed', $message);
            return '';
        }

        $payload = json_decode((string) $response['body'], true);
        if (!is_array($payload) || !isset($payload['files']) || !is_array($payload['files']))
        {
            return '';
        }

        foreach ($payload['files'] as $fileRow)
        {
            if (!isset($fileRow['id']))
            {
                continue;
            }
            return (string) $fileRow['id'];
        }

        return '';
    }

    private function createFolder($accessToken, $parentID, $folderName)
    {
        $payload = array(
            'name' => (string) $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => array((string) $parentID)
        );

        $response = $this->httpRequest(
            'https://www.googleapis.com/drive/v3/files?fields=' . rawurlencode('id,name'),
            'POST',
            json_encode($payload),
            array(
                'Accept: application/json',
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json; charset=UTF-8'
            ),
            true
        );

        if (!$response['ok'])
        {
            $providerDetails = $this->parseProviderErrorDetails((string) $response['body']);
            if ($this->isDriveApiDisabledError($providerDetails))
            {
                $this->setError(
                    'googleDriveApiDisabled',
                    'Google Drive API appears disabled in Google Cloud. Enable it for this project and retry.'
                );
                return '';
            }

            $message = $this->buildProviderErrorMessage(
                'Unable to create Google Drive folder.',
                $response['statusCode'],
                $providerDetails
            );
            $this->setError('googleDriveFolderCreateFailed', $message);
            return '';
        }

        $data = json_decode((string) $response['body'], true);
        if (!is_array($data) || !isset($data['id']))
        {
            $this->setError('googleDriveFolderCreateFailed', 'Google Drive folder create response was invalid.');
            return '';
        }

        return (string) $data['id'];
    }

    private function uploadAndConvertDocx($accessToken, $filePath, $filename, $parentFolderID)
    {
        $fileContents = @file_get_contents($filePath);
        if ($fileContents === false)
        {
            $this->setError('googleDriveUploadFailed', 'Unable to read attachment for upload.');
            return array();
        }

        $name = trim((string) $filename);
        if ($name === '')
        {
            $name = 'Transformed CV.docx';
        }

        $boundary = 'opencats_drive_' . md5(uniqid((string) mt_rand(), true));
        $metadata = json_encode(array(
            'name' => $name,
            'parents' => array((string) $parentFolderID),
            'mimeType' => 'application/vnd.google-apps.document'
        ));

        $body = ''
            . '--' . $boundary . "\r\n"
            . "Content-Type: application/json; charset=UTF-8\r\n\r\n"
            . $metadata . "\r\n"
            . '--' . $boundary . "\r\n"
            . "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n"
            . $fileContents . "\r\n"
            . '--' . $boundary . "--\r\n";

        $response = $this->httpRequest(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields='
            . rawurlencode('id,name,webViewLink,mimeType'),
            'POST',
            $body,
            array(
                'Accept: application/json',
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: multipart/related; boundary=' . $boundary
            ),
            true
        );

        if (!$response['ok'])
        {
            $providerDetails = $this->parseProviderErrorDetails((string) $response['body']);
            if ($this->isDriveApiDisabledError($providerDetails))
            {
                $this->setError(
                    'googleDriveApiDisabled',
                    'Google Drive API appears disabled in Google Cloud. Enable it for this project and retry.'
                );
                return array();
            }

            $message = $this->buildProviderErrorMessage(
                'Google Drive upload failed.',
                $response['statusCode'],
                $providerDetails
            );
            $this->setError('googleDriveUploadFailed', $message);
            return array();
        }

        $payload = json_decode((string) $response['body'], true);
        if (!is_array($payload) || !isset($payload['id']))
        {
            $this->setError('googleDriveUploadFailed', 'Google Drive upload returned an invalid response.');
            return array();
        }

        return $payload;
    }

    private function httpRequest($url, $method = 'GET', $data = array(), $headers = array(), $isRawBody = false)
    {
        $method = strtoupper((string) $method);
        $body = '';

        if ($isRawBody)
        {
            $body = (string) $data;
        }
        else
        {
            if (is_array($data))
            {
                $body = http_build_query($data, '', '&');
            }
            else
            {
                $body = (string) $data;
            }
        }

        if ($method === 'GET' && $body !== '' && !$isRawBody)
        {
            $url .= (strpos($url, '?') === false ? '?' : '&') . $body;
            $body = '';
        }

        $responseBody = '';
        $statusCode = 0;

        if (function_exists('curl_init'))
        {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 20);
            curl_setopt($curl, CURLOPT_TIMEOUT, 60);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);

            if (!empty($headers))
            {
                curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            }

            if ($method === 'POST')
            {
                curl_setopt($curl, CURLOPT_POST, true);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
            }
            else if ($method !== 'GET')
            {
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
                if ($body !== '')
                {
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
                }
            }

            $responseBody = curl_exec($curl);
            if ($responseBody === false)
            {
                $responseBody = '';
            }

            $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
        }
        else
        {
            $contextHeaders = '';
            foreach ($headers as $header)
            {
                $contextHeaders .= $header . "\r\n";
            }

            $contextOptions = array(
                'http' => array(
                    'method' => $method,
                    'header' => $contextHeaders,
                    'ignore_errors' => true,
                    'timeout' => 60
                )
            );
            if ($method !== 'GET' && $body !== '')
            {
                $contextOptions['http']['content'] = $body;
            }

            $context = stream_context_create($contextOptions);
            $responseBody = @file_get_contents($url, false, $context);
            if ($responseBody === false)
            {
                $responseBody = '';
            }

            if (isset($http_response_header) && is_array($http_response_header))
            {
                foreach ($http_response_header as $headerLine)
                {
                    if (preg_match('/^HTTP\/\d+\.\d+\s+(\d+)/i', $headerLine, $matches))
                    {
                        $statusCode = (int) $matches[1];
                        break;
                    }
                }
            }
        }

        return array(
            'ok' => ($statusCode >= 200 && $statusCode < 300),
            'statusCode' => $statusCode,
            'body' => $responseBody
        );
    }

    private function setError($code, $message)
    {
        $this->_lastErrorCode = (string) $code;
        $this->_lastErrorMessage = (string) $message;
        if (function_exists('error_log'))
        {
            error_log(
                'GoogleDriveClient error | ' . json_encode(array(
                    'siteID' => $this->_siteID,
                    'userID' => $this->_userID,
                    'code' => $this->_lastErrorCode,
                    'message' => $this->_lastErrorMessage
                ))
            );
        }
    }

    private function parseProviderErrorDetails($bodyText)
    {
        $details = array(
            'error' => '',
            'errorDescription' => '',
            'message' => '',
            'reason' => '',
            'status' => ''
        );

        $payload = json_decode((string) $bodyText, true);
        if (!is_array($payload))
        {
            return $details;
        }

        if (isset($payload['error']) && is_string($payload['error']))
        {
            $details['error'] = trim((string) $payload['error']);
        }
        if (isset($payload['error_description']) && is_string($payload['error_description']))
        {
            $details['errorDescription'] = trim((string) $payload['error_description']);
        }
        if (isset($payload['error']) && is_array($payload['error']))
        {
            $errorNode = $payload['error'];
            if (isset($errorNode['status']) && is_string($errorNode['status']))
            {
                $details['status'] = trim((string) $errorNode['status']);
            }
            if (isset($errorNode['message']) && is_string($errorNode['message']))
            {
                $details['message'] = trim((string) $errorNode['message']);
            }
            if (isset($errorNode['errors']) && is_array($errorNode['errors']))
            {
                foreach ($errorNode['errors'] as $row)
                {
                    if (!is_array($row))
                    {
                        continue;
                    }
                    if (isset($row['reason']) && trim((string) $row['reason']) !== '')
                    {
                        $details['reason'] = trim((string) $row['reason']);
                        break;
                    }
                }
            }
        }

        return $details;
    }

    private function isDriveApiDisabledError($providerDetails)
    {
        if (!is_array($providerDetails))
        {
            return false;
        }

        $reason = strtolower(trim((string) (isset($providerDetails['reason']) ? $providerDetails['reason'] : '')));
        $message = strtolower(trim((string) (isset($providerDetails['message']) ? $providerDetails['message'] : '')));
        $errorDescription = strtolower(trim((string) (isset($providerDetails['errorDescription']) ? $providerDetails['errorDescription'] : '')));

        if ($reason === 'accessnotconfigured')
        {
            return true;
        }

        if (strpos($message, 'api has not been used') !== false || strpos($message, 'is disabled') !== false)
        {
            return true;
        }

        if (strpos($errorDescription, 'api has not been used') !== false || strpos($errorDescription, 'is disabled') !== false)
        {
            return true;
        }

        return false;
    }

    private function buildProviderErrorMessage($defaultMessage, $statusCode, $providerDetails)
    {
        $parts = array();
        $defaultMessage = trim((string) $defaultMessage);
        if ($defaultMessage !== '')
        {
            $parts[] = $defaultMessage;
        }

        $statusCode = (int) $statusCode;
        if ($statusCode > 0)
        {
            $parts[] = '(HTTP ' . $statusCode . ')';
        }

        if (is_array($providerDetails))
        {
            $providerMessage = trim((string) (isset($providerDetails['message']) ? $providerDetails['message'] : ''));
            $providerReason = trim((string) (isset($providerDetails['reason']) ? $providerDetails['reason'] : ''));
            $providerError = trim((string) (isset($providerDetails['error']) ? $providerDetails['error'] : ''));
            $providerErrorDescription = trim((string) (isset($providerDetails['errorDescription']) ? $providerDetails['errorDescription'] : ''));

            if ($providerMessage !== '')
            {
                $parts[] = $providerMessage;
            }
            else if ($providerErrorDescription !== '')
            {
                $parts[] = $providerErrorDescription;
            }
            else if ($providerError !== '')
            {
                $parts[] = $providerError;
            }

            if ($providerReason !== '')
            {
                $parts[] = 'reason: ' . $providerReason;
            }
        }

        return trim(implode(' ', $parts));
    }
}
