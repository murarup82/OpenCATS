<?php
/**
 * TalentFitFlow OpenCATS Integration Client
 *
 * @package    CATS
 * @subpackage Library
 */
class TalentFitFlowClient
{
    private $_baseUrl = '';
    private $_apiKey = '';
    private $_hmacSecret = '';
    private $_lastError = '';
    private $_lastHttpStatus = null;

    public function __construct($baseUrl = null, $apiKey = null, $hmacSecret = null)
    {
        $this->_baseUrl = $this->_normalizeBaseUrl(
            $this->_resolveSetting('TALENTFIT_BASE_URL', $baseUrl)
        );
        $this->_apiKey = $this->_resolveSetting('OPENCATS_API_KEY', $apiKey);
        $this->_hmacSecret = $this->_resolveSetting('OPENCATS_HMAC_SECRET', $hmacSecret);
    }

    public function isConfigured()
    {
        return ($this->_baseUrl !== '' && $this->_apiKey !== '' && $this->_hmacSecret !== '');
    }

    public function getLastError()
    {
        return $this->_lastError;
    }

    public function getLastHttpStatus()
    {
        return $this->_lastHttpStatus;
    }

    public function getBaseUrl()
    {
        return $this->_baseUrl;
    }

    /**
     * Submits a CV (and optional JD) for TalentFitFlow processing.
     *
     * Required options:
     * - cvFilePath (string) path to the CV file.
     *
     * Optional options (keys):
     * - jdFilePath (string) path to JD file
     * - jdText (string) job description text (UTF-8)
     * - candidateId (string)
     * - cvFileName (string) override filename for cv_file
     * - metadata (string|array|object) JSON string or structure to encode
     * - language, languageFolder, roleType, companyId (strings)
     *
     * @return array|false
     */
    public function createTransform($cvFilePath, $options = array())
    {
        $this->_lastError = '';

        if (!$this->isConfigured())
        {
            return $this->_setError('TalentFitFlow is not configured.');
        }

        if (!is_string($cvFilePath) || $cvFilePath === '' || !is_readable($cvFilePath))
        {
            return $this->_setError('CV file is missing or unreadable.');
        }

        $jdFilePath = $this->_getOption($options, 'jdFilePath');
        if ($jdFilePath !== '' && !is_readable($jdFilePath))
        {
            return $this->_setError('JD file is missing or unreadable.');
        }

        $jdText = $this->_getOptionValue($options, 'jdText');
        if ($jdText === null)
        {
            $jdText = '';
        }
        else
        {
            $jdText = (string) $jdText;
        }
        if ($jdText !== '')
        {
            $jdText = $this->_normalizeText($jdText);
        }

        $candidateId = $this->_getOption($options, 'candidateId');
        $language = $this->_getOption($options, 'language');
        $languageFolder = $this->_getOption($options, 'languageFolder');
        $roleType = $this->_getOption($options, 'roleType');
        $companyId = $this->_getOption($options, 'companyId');
        $cvFileName = $this->_getOption($options, 'cvFileName');
        $metadata = $this->_normalizeMetadata($this->_getOptionValue($options, 'metadata'));
        if ($metadata === false)
        {
            return $this->_setError('Metadata must be a string or a JSON-encodable value.');
        }

        $timestamp = $this->_getTimestamp();
        $cvHash = hash_file('sha256', $cvFilePath);
        if ($cvHash === false)
        {
            return $this->_setError('Failed to hash CV file.');
        }

        if ($jdFilePath !== '')
        {
            $jdFileHash = hash_file('sha256', $jdFilePath);
            if ($jdFileHash === false)
            {
                return $this->_setError('Failed to hash JD file.');
            }
        }
        else
        {
            $jdFileHash = '';
        }

        if ($jdText !== '')
        {
            $jdTextHash = hash('sha256', $jdText);
            if ($jdTextHash === false)
            {
                return $this->_setError('Failed to hash JD text.');
            }
        }
        else
        {
            $jdTextHash = '';
        }

        $payload = implode(
            '.',
            array(
                $timestamp,
                $cvHash,
                $jdFileHash,
                $jdTextHash,
                $candidateId,
                $language,
                $languageFolder,
                $roleType,
                $companyId
            )
        );

        $signature = $this->_signPayload($payload);
        $headers = $this->_buildSignedHeaders($timestamp, $signature);

        $endpointPath = '/api/integrations/opencats/candidate-parse/v1';
        $resolvedUrl = $this->_buildUrl($endpointPath);
        $baseUrl = $this->_baseUrl;
        $hasApiSuffix = (preg_match('#/api$#i', $baseUrl) === 1);
        $hasTrailingSlash = (substr($baseUrl, -1) === '/');
        error_log(
            'TFF candidate-parse request: ' .
            'method=POST, url=' . $resolvedUrl .
            ', baseUrl=' . $baseUrl .
            ', baseUrlHasApiSuffix=' . ($hasApiSuffix ? '1' : '0') .
            ', baseUrlHasTrailingSlash=' . ($hasTrailingSlash ? '1' : '0') .
            ', endpointPath=' . $endpointPath .
            ', headers=' . implode('; ', $headers)
        );

        $postFields = array(
            'cv_file' => $this->_createCurlFile($cvFilePath, $cvFileName)
        );
        if ($jdFilePath !== '')
        {
            $postFields['jd_file'] = $this->_createCurlFile($jdFilePath);
        }
        if ($jdText !== '')
        {
            $postFields['jd_text'] = $jdText;
        }
        if ($candidateId !== '')
        {
            $postFields['candidate_id'] = $candidateId;
        }
        if ($metadata !== '')
        {
            $postFields['metadata'] = $metadata;
        }
        if ($language !== '')
        {
            $postFields['language'] = $language;
        }
        if ($languageFolder !== '')
        {
            $postFields['languageFolder'] = $languageFolder;
        }
        if ($roleType !== '')
        {
            $postFields['roleType'] = $roleType;
        }
        if ($companyId !== '')
        {
            $postFields['companyId'] = $companyId;
        }

        return $this->_requestJson(
            'POST',
            '/api/integrations/opencats/transform',
            $headers,
            $postFields,
            array(200, 202)
        );
    }

    /**
     * Submits a CV for TalentFitFlow candidate parsing.
     *
     * Required options:
     * - consent (string) JSON consent payload.
     *
     * Optional options:
     * - requestedFields (string) JSON array or CSV
     * - language, companyId, candidateId, idempotencyKey (strings)
     *
     * @return array|false
     */
    public function createCandidateParse($cvFilePath, $options = array())
    {
        $this->_lastError = '';

        if (!$this->isConfigured())
        {
            return $this->_setError('TalentFitFlow is not configured.');
        }

        if (!is_string($cvFilePath) || $cvFilePath === '' || !is_readable($cvFilePath))
        {
            return $this->_setError('CV file is missing or unreadable.');
        }

        $consent = $this->_getOptionValue($options, 'consent');
        if ($consent === null || trim((string) $consent) === '')
        {
            return $this->_setError('Consent is required.');
        }
        $consent = trim((string) $consent);

        $requestedFields = $this->_getOption($options, 'requestedFields');
        $language = $this->_getOption($options, 'language');
        $companyId = $this->_getOption($options, 'companyId');
        $candidateId = $this->_getOption($options, 'candidateId');
        $idempotencyKey = $this->_getOption($options, 'idempotencyKey');

        $timestamp = $this->_getTimestamp();
        $cvHash = hash_file('sha256', $cvFilePath);
        if ($cvHash === false)
        {
            return $this->_setError('Failed to hash CV file.');
        }

        /*
         * Candidate parse signing must preserve empty segments:
         * {ts}.{cvHash}...{candidateId}.{language}..{companyId}
         * (9 segments, 8 separators including a trailing dot).
         */
        $payload = implode(
            '.',
            array(
                $timestamp,
                $cvHash,
                '',
                '',
                $candidateId,
                $language,
                '',
                $companyId,
                ''
            )
        );

        $signature = $this->_signPayload($payload);
        $headers = $this->_buildSignedHeaders($timestamp, $signature);

        $postFields = array(
            'cv_file' => $this->_createCurlFile($cvFilePath),
            'consent' => $consent
        );
        if ($requestedFields !== '')
        {
            $postFields['requested_fields'] = $requestedFields;
        }
        if ($language !== '')
        {
            $postFields['language'] = $language;
        }
        if ($companyId !== '')
        {
            $postFields['companyId'] = $companyId;
        }
        if ($candidateId !== '')
        {
            $postFields['candidate_id'] = $candidateId;
        }
        if ($idempotencyKey !== '')
        {
            $postFields['idempotency_key'] = $idempotencyKey;
        }

        return $this->_requestJson(
            'POST',
            $endpointPath,
            $headers,
            $postFields,
            array(200, 202)
        );
    }

    /**
     * Retrieves status for a TalentFitFlow candidate parse job.
     *
     * @param string $jobId
     * @return array|false
     */
    public function getCandidateParseStatus($jobId)
    {
        $this->_lastError = '';

        if (!$this->isConfigured())
        {
            return $this->_setError('TalentFitFlow is not configured.');
        }

        $jobId = trim((string) $jobId);
        if ($jobId === '')
        {
            return $this->_setError('Job ID is required.');
        }

        $timestamp = $this->_getTimestamp();
        $payload = $timestamp . '.' . $jobId;
        $signature = $this->_signPayload($payload);
        $headers = $this->_buildSignedHeaders($timestamp, $signature);

        return $this->_requestJson(
            'GET',
            '/api/integrations/opencats/candidate-parse/v1/' . rawurlencode($jobId),
            $headers,
            null,
            array(200)
        );
    }

    /**
     * Retrieves status for a TalentFitFlow transform job.
     *
     * @param string $jobId
     * @return array|false
     */
    public function getTransformStatus($jobId)
    {
        $this->_lastError = '';

        if (!$this->isConfigured())
        {
            return $this->_setError('TalentFitFlow is not configured.');
        }

        $jobId = trim((string) $jobId);
        if ($jobId === '')
        {
            return $this->_setError('Job ID is required.');
        }

        $timestamp = $this->_getTimestamp();
        $payload = $timestamp . '.' . $jobId;
        $signature = $this->_signPayload($payload);
        $headers = $this->_buildSignedHeaders($timestamp, $signature);

        return $this->_requestJson(
            'GET',
            '/api/integrations/opencats/transform/' . rawurlencode($jobId),
            $headers,
            null,
            array(200)
        );
    }

    /**
     * Pings the TalentFitFlow integration.
     *
     * @return array|false
     */
    public function ping()
    {
        $this->_lastError = '';

        if (!$this->isConfigured())
        {
            return $this->_setError('TalentFitFlow is not configured.');
        }

        $timestamp = $this->_getTimestamp();
        $payload = $timestamp . '.ping';
        $signature = $this->_signPayload($payload);
        $headers = $this->_buildSignedHeaders($timestamp, $signature);

        return $this->_requestJson(
            'GET',
            '/api/integrations/opencats/ping',
            $headers,
            null,
            array(200)
        );
    }

    /**
     * Downloads the transformed CV using the cv_download_url from the API.
     *
     * @param string $downloadUrl
     * @param string $destinationPath Optional output path to save the file.
     * @return array|false
     */
    public function downloadTransformedCv($downloadUrl, $destinationPath = '')
    {
        $this->_lastError = '';

        $downloadUrl = trim((string) $downloadUrl);
        if ($downloadUrl === '')
        {
            return $this->_setError('Download URL is required.');
        }

        $response = $this->_requestRaw(
            'GET',
            $downloadUrl,
            array(),
            null,
            array(200),
            true
        );

        if ($response === false)
        {
            return false;
        }

        if ($destinationPath !== '')
        {
            $bytesWritten = @file_put_contents($destinationPath, $response['body']);
            if ($bytesWritten === false)
            {
                return $this->_setError('Failed to write downloaded CV.');
            }
        }

        return $response;
    }

    /**
     * Downloads the analysis PDF using the analysis_pdf download_url from the API.
     *
     * @param string $downloadUrl
     * @param string $destinationPath Optional output path to save the file.
     * @return array|false
     */
    public function downloadAnalysisPdf($downloadUrl, $destinationPath = '')
    {
        $this->_lastError = '';

        $downloadUrl = trim((string) $downloadUrl);
        if ($downloadUrl === '')
        {
            return $this->_setError('Download URL is required.');
        }

        $response = $this->_requestRaw(
            'GET',
            $downloadUrl,
            array(),
            null,
            array(200, 202),
            true
        );

        if ($response === false)
        {
            return false;
        }

        if ((int) $response['status'] === 202)
        {
            $data = json_decode($response['body'], true);
            if ($data === null && function_exists('json_last_error') && json_last_error() !== JSON_ERROR_NONE)
            {
                return $this->_setError('Invalid JSON response from TalentFitFlow.');
            }
            $response['json'] = is_array($data) ? $data : array();
            return $response;
        }

        if ($destinationPath !== '')
        {
            $bytesWritten = @file_put_contents($destinationPath, $response['body']);
            if ($bytesWritten === false)
            {
                return $this->_setError('Failed to write downloaded analysis PDF.');
            }
        }

        return $response;
    }

    private function _resolveSetting($constantName, $overrideValue)
    {
        if ($overrideValue !== null)
        {
            return trim((string) $overrideValue);
        }

        if (defined($constantName))
        {
            return trim((string) constant($constantName));
        }

        if (function_exists('getenv'))
        {
            $envValue = getenv($constantName);
            if ($envValue !== false && $envValue !== '')
            {
                return trim((string) $envValue);
            }
        }

        if (isset($_ENV[$constantName]))
        {
            return trim((string) $_ENV[$constantName]);
        }

        if (isset($_SERVER[$constantName]))
        {
            return trim((string) $_SERVER[$constantName]);
        }

        return '';
    }

    private function _normalizeBaseUrl($baseUrl)
    {
        $baseUrl = trim((string) $baseUrl);
        if ($baseUrl === '')
        {
            return '';
        }

        return rtrim($baseUrl, '/');
    }

    private function _getOption($options, $key)
    {
        if (!is_array($options) || !array_key_exists($key, $options))
        {
            return '';
        }

        $value = $options[$key];
        if ($value === null)
        {
            return '';
        }

        return trim((string) $value);
    }

    private function _getOptionValue($options, $key)
    {
        if (!is_array($options) || !array_key_exists($key, $options))
        {
            return null;
        }

        return $options[$key];
    }

    private function _normalizeMetadata($metadata)
    {
        if ($metadata === null || $metadata === '')
        {
            return '';
        }

        if (is_string($metadata))
        {
            return $metadata;
        }

        if (is_array($metadata) || is_object($metadata))
        {
            if (!function_exists('json_encode'))
            {
                return false;
            }

            $encoded = json_encode($metadata);
            if ($encoded === false && function_exists('json_last_error') && json_last_error() !== JSON_ERROR_NONE)
            {
                return false;
            }
            return $encoded;
        }

        return false;
    }

    private function _normalizeText($text)
    {
        $text = (string) $text;

        if (function_exists('mb_detect_encoding') && function_exists('mb_convert_encoding'))
        {
            $encoding = mb_detect_encoding($text, 'UTF-8, ISO-8859-1, Windows-1252', true);
            if ($encoding !== false && $encoding !== 'UTF-8')
            {
                $text = mb_convert_encoding($text, 'UTF-8', $encoding);
            }
        }

        return $text;
    }

    private function _getTimestamp()
    {
        return (string) round(microtime(true) * 1000);
    }

    private function _signPayload($payload)
    {
        return hash_hmac('sha256', $payload, $this->_hmacSecret);
    }

    private function _buildSignedHeaders($timestamp, $signature)
    {
        return array(
            'x-api-key: ' . $this->_apiKey,
            'x-timestamp: ' . $timestamp,
            'x-signature: ' . $signature
        );
    }

    private function _createCurlFile($filePath, $postName = '')
    {
        if (class_exists('CURLFile'))
        {
            if ($postName !== '')
            {
                return new CURLFile($filePath, '', $postName);
            }
            return new CURLFile($filePath);
        }

        return '@' . $filePath;
    }

    private function _requestJson($method, $path, $headers, $postFields, $expectedStatusCodes)
    {
        $response = $this->_requestRaw($method, $path, $headers, $postFields, $expectedStatusCodes, false);
        if ($response === false)
        {
            return false;
        }

        $data = json_decode($response['body'], true);
        if ($data === null && function_exists('json_last_error') && json_last_error() !== JSON_ERROR_NONE)
        {
            return $this->_setError('Invalid JSON response from TalentFitFlow.');
        }

        return $data;
    }

    private function _requestRaw($method, $pathOrUrl, $headers, $postFields, $expectedStatusCodes, $includeHeaders)
    {
        if (!function_exists('curl_init'))
        {
            return $this->_setError('cURL is required to call TalentFitFlow.');
        }

        $url = $this->_buildUrl($pathOrUrl);
        if ($url === false)
        {
            return false;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_HEADER, $includeHeaders ? true : false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        if ($postFields !== null)
        {
            if (!class_exists('CURLFile') && defined('CURLOPT_SAFE_UPLOAD'))
            {
                curl_setopt($ch, CURLOPT_SAFE_UPLOAD, false);
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        }

        $response = curl_exec($ch);
        if ($response === false)
        {
            $error = curl_error($ch);
            curl_close($ch);
            return $this->_setError('cURL error: ' . $error);
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $this->_lastHttpStatus = $status;
        $headerSize = $includeHeaders ? curl_getinfo($ch, CURLINFO_HEADER_SIZE) : 0;
        curl_close($ch);

        if (!in_array($status, $expectedStatusCodes, true))
        {
            $body = $includeHeaders ? substr($response, $headerSize) : $response;
            $message = '';

            $decoded = json_decode($body, true);
            if (is_array($decoded))
            {
                if (isset($decoded['error_message']) && $decoded['error_message'] !== '')
                {
                    $message = (string) $decoded['error_message'];
                    if (isset($decoded['error_code']) && $decoded['error_code'] !== '')
                    {
                        $message = (string) $decoded['error_code'] . ': ' . $message;
                    }
                }
                else if (isset($decoded['error']) && $decoded['error'] !== '')
                {
                    $message = (string) $decoded['error'];
                }
                else if (isset($decoded['error_code']) && $decoded['error_code'] !== '')
                {
                    $message = (string) $decoded['error_code'];
                }
            }

            if ($message === '')
            {
                $message = $body;
            }

            return $this->_setError('Unexpected HTTP status ' . $status . ' from TalentFitFlow: ' . $message);
        }

        if ($includeHeaders)
        {
            $headersRaw = substr($response, 0, $headerSize);
            $body = substr($response, $headerSize);
            return array(
                'status' => $status,
                'headers' => $this->_parseHeaders($headersRaw),
                'body' => $body
            );
        }

        return array(
            'status' => $status,
            'headers' => array(),
            'body' => $response
        );
    }

    private function _buildUrl($pathOrUrl)
    {
        $pathOrUrl = trim((string) $pathOrUrl);
        if ($pathOrUrl === '')
        {
            return $this->_setError('URL is required.');
        }

        if (preg_match('/^https?:\\/\\//i', $pathOrUrl))
        {
            return $pathOrUrl;
        }

        if ($this->_baseUrl === '')
        {
            return $this->_setError('Base URL is not configured.');
        }

        return $this->_baseUrl . $pathOrUrl;
    }

    private function _parseHeaders($headersRaw)
    {
        $headers = array();
        $lines = preg_split("/\r\n|\n|\r/", trim($headersRaw));
        foreach ($lines as $line)
        {
            if (strpos($line, ':') === false)
            {
                continue;
            }
            list($name, $value) = explode(':', $line, 2);
            $headers[trim($name)] = trim($value);
        }
        return $headers;
    }

    private function _setError($message)
    {
        $this->_lastError = $message;
        return false;
    }
}

?>
