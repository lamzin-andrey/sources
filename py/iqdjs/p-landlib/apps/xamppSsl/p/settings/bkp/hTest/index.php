<?php
include __DIR__ . '/Request.php';

$r = new Request();
$rr = $r->execute("site.illine");
var_dump($rr);
