<?php
require 'lib/StringUtility.php';
$tests = array('+40 767 358 954', '+40767358954', '+1 407 673 5895', '4076735895', '407-673-5895 x4');
foreach ($tests as $t) {
    echo $t . ' => ' . StringUtility::extractPhoneNumber($t) . PHP_EOL;
}
?>
