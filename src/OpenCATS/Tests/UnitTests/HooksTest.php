<?php
use PHPUnit\Framework\TestCase;

if (!defined('LEGACY_ROOT'))
{
    define('LEGACY_ROOT', '.');
}

include_once(LEGACY_ROOT . '/lib/Hooks.php');

class HooksTest extends TestCase
{
    function testGetReturnsNoopWithoutSession()
    {
        $result = Hooks::get('ANY_HOOK');
        $this->assertSame('return true;', $result);
    }

    function testGetReturnsNoopForAnyHookName()
    {
        $this->assertSame('return true;', Hooks::get(''));
        $this->assertSame('return true;', Hooks::get('CANDIDATES_LIST'));
        $this->assertSame('return true;', Hooks::get('IMPORT_ON_IMPORT_3'));
    }

    function testEvalOfReturnValueIsTrue()
    {
        $result = eval(Hooks::get('SOME_HOOK'));
        $this->assertTrue($result);
    }
}
