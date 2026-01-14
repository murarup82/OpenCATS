<?php
require_once 'lib/GraphGenerator.php';
$labels = array('Total Pipeline','Allocated','Delivery Validated','Proposed to Customer','Customer Interview','Customer Approved','Avel Approved','Offer Negotiation','Offer Accepted','Hired','Rejected');
$values = array(4,1,1,1,1,1,1,1,1,1,1);
$colors = array_fill(0, count($labels), new DarkGreen);
$chart = new GraphComparisonChart($labels, $values, $colors, 'Test', 600, 400, 4);
$chart->draw();
?>
