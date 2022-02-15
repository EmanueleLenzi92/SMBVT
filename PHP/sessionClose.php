<?php
session_start();
session_destroy();

// array json
$arrayJson= array( "msg" => "session closed");		
$data= json_encode($arrayJson);
echo $data;