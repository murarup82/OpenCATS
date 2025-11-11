<?php
require_once 'lib/GraphGenerator.php';
$labels = array('Total Pipeline','New','HR Validated','Require Tech Evaluation','Tech Validated','Proposed to Customer','Client Decision Pending','Approved by Customer/Project','Under Offer Negotiation','Offer Accepted','Activity Started');
$values = array(4,1,1,1,1,1,1,1,1,1,1);
$colors = array_fill(0, count($labels), new DarkGreen);
$chart = new GraphComparisonChart($labels, $values, $colors, 'Test', 600, 400, 4);
$chart->draw();
?>
