<?php

$page= $_GET["urlob"];

$response = file_get_contents($page);



		$arrayJson= array("html"=> $response, "urlob" => $page);	
		$data= json_encode($arrayJson);
		echo $data;
		
?>