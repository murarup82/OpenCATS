<?php
use PHPUnit\Framework\TestCase;

if (!defined('LEGACY_ROOT'))
{
    define('LEGACY_ROOT', '.');
}

/* ACL.php includes config.php which defines ACCESS_LEVEL_* constants. */
include_once(LEGACY_ROOT . '/lib/ACL.php');

class ACLTest extends TestCase
{
    function testGetAccessLevelReturnsDefaultWhenNoACLSetupClass()
    {
        $level = ACL::getAccessLevel('candidates', array(), 2);
        $this->assertSame(2, $level);
    }

    function testGetAccessLevelReturnsDefaultForEmptyCategories()
    {
        $level = ACL::getAccessLevel('candidates.add', array(), 5);
        $this->assertSame(5, $level);
    }

    function testHasACLEntryReturnsFalseForMissingCategory()
    {
        $aclmap = array('recruiter' => array('candidates' => 4));
        $this->assertFalse(ACL::_hasACLEntry($aclmap, 'nonexistent', 'candidates'));
    }

    function testHasACLEntryReturnsFalseForMissingObject()
    {
        $aclmap = array('recruiter' => array('candidates' => 4));
        $this->assertFalse(ACL::_hasACLEntry($aclmap, 'recruiter', 'calendar'));
    }

    function testHasACLEntryReturnsTrueForExistingEntry()
    {
        $aclmap = array('recruiter' => array('candidates' => 4));
        $this->assertTrue(ACL::_hasACLEntry($aclmap, 'recruiter', 'candidates'));
    }

    function testHasACLEntryReturnsFalseWhenValueIsNull()
    {
        $aclmap = array('recruiter' => array('candidates' => null));
        $this->assertFalse(ACL::_hasACLEntry($aclmap, 'recruiter', 'candidates'));
    }
}
