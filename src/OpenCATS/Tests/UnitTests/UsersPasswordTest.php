<?php
use PHPUnit\Framework\TestCase;

if (!defined('LEGACY_ROOT'))
{
    define('LEGACY_ROOT', '.');
}

/* Stub the DB constructor dependency so we can instantiate Users without a DB. */
if (!class_exists('DatabaseConnection'))
{
    class DatabaseConnection
    {
        public function __construct() {}
    }
}

include_once(LEGACY_ROOT . '/lib/Users.php');

/**
 * Tests for password hashing logic in Users.
 * Uses reflection to access private methods since they are pure utility functions
 * that do not require a database connection.
 */
class UsersPasswordTest extends TestCase
{
    private $users;
    private $refClass;

    protected function setUp(): void
    {
        /* Construct without a real DB — methods under test don't use it. */
        $this->users = $this->getMockBuilder(Users::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->refClass = new ReflectionClass(Users::class);
    }

    private function callPrivate(string $method, ...$args)
    {
        $m = $this->refClass->getMethod($method);
        $m->setAccessible(true);
        return $m->invoke($this->users, ...$args);
    }

    function testHashPasswordProducesPasswordHashFormat()
    {
        $hash = $this->callPrivate('hashPassword', 'testpassword');
        $info = password_get_info($hash);
        $this->assertNotEmpty($info['algo'], 'hashPassword must use password_hash(), not MD5');
    }

    function testHashPasswordIsVerifiable()
    {
        $hash = $this->callPrivate('hashPassword', 'mysecretpass');
        $this->assertTrue(password_verify('mysecretpass', $hash));
        $this->assertFalse(password_verify('wrongpass', $hash));
    }

    function testIsLegacyMD5HashDetectsRealMD5()
    {
        $md5 = md5('somestring');
        $this->assertTrue($this->callPrivate('isLegacyMD5Hash', $md5));
    }

    function testIsLegacyMD5HashRejectsBcrypt()
    {
        $bcrypt = password_hash('somestring', PASSWORD_BCRYPT);
        $this->assertFalse($this->callPrivate('isLegacyMD5Hash', $bcrypt));
    }

    function testIsLegacyMD5HashRejectsShortString()
    {
        $this->assertFalse($this->callPrivate('isLegacyMD5Hash', 'abc123'));
    }

    function testVerifyPasswordWorksWithBcrypt()
    {
        $hash = password_hash('correctpassword', PASSWORD_BCRYPT);
        $this->assertTrue($this->callPrivate('verifyPassword', 'correctpassword', $hash));
        $this->assertFalse($this->callPrivate('verifyPassword', 'wrongpassword', $hash));
    }

    function testVerifyPasswordFallsBackToMD5ForLegacyHashes()
    {
        $legacyHash = md5('oldpassword');
        $this->assertTrue($this->callPrivate('verifyPassword', 'oldpassword', $legacyHash));
        $this->assertFalse($this->callPrivate('verifyPassword', 'wrongpassword', $legacyHash));
    }

    function testShouldUpgradePasswordHashReturnsTrueForMD5()
    {
        $md5 = md5('somepassword');
        $this->assertTrue($this->callPrivate('shouldUpgradePasswordHash', $md5));
    }

    function testShouldUpgradePasswordHashReturnsFalseForCurrentBcrypt()
    {
        $hash = password_hash('somepassword', PASSWORD_DEFAULT);
        $this->assertFalse($this->callPrivate('shouldUpgradePasswordHash', $hash));
    }
}
