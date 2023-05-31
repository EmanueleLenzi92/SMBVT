<?php

$query= $_GET["quer"];

$ch = curl_init($query); // such as http://example.com/example.xml
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, 0);
$data = curl_exec($ch);
curl_close($ch);

		$arrayJson= array("response"=> $data, "url"=>$query);	
		$data= json_encode($arrayJson);
		echo $data;


?>