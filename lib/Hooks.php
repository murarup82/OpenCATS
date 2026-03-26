<?php
/**
 * CATS
 * Hooks Library
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is "CATS Standard Edition".
 *
 * The Initial Developer of the Original Code is Cognizo Technologies, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005 - 2007
 * (or from the year in which this file was created to the year 2007) by
 * Cognizo Technologies, Inc. All Rights Reserved.
 *
 *
 * @package    CATS
 * @subpackage Library
 * @copyright Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 * @version    $Id: Hooks.php 3587 2007-11-13 03:55:57Z will $
 */

/**
 *	Hooks Library
 *	@package    CATS
 *	@subpackage Library
 */
class Hooks
{
    /* Prevent this class from being instantiated. */
    private function __construct() {}
    private function __clone() {}


    /**
     * Returns a safe no-op string for eval() call sites.
     *
     * The hooks system was designed for third-party module extensibility but
     * no modules register hook code in this codebase. The prior implementation
     * read PHP code strings from $_SESSION['hooks'] and returned them for
     * eval(), which created an arbitrary code execution risk if the session
     * was tampered with. Since hooks are unused, the session lookup is removed.
     *
     * @param string $hookName
     * @return string
     */
    public static function get($hookName)
    {
        return 'return true;';
    }
}

?>
