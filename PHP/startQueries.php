
<?php
//DB POSTGRES
require('PgConn.php');


	$events=[];
	$entitys=[];
	$info="";
	$relations="";
	$currentdbname= $_POST['dbusername'];
	
	
	
	
	
	//CREA TABELLA ((idNarra)UserName-idWikiSubject) se non esiste
	$sql='CREATE TABLE IF NOT EXISTS "'.$currentdbname.'"(
    "id" character(500) primary key,
    "value" jsonb
	);
	';
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	pg_free_result($result);
	
	

	//get events
	$sql= "SELECT value FROM \"".$currentdbname."\" where id ~ '^ev'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());


	while ($row=pg_fetch_assoc($result)) {
		array_push($events, $row['value']);
	}
	pg_free_result($result);
	
	
	//get entitys
	$sql= "SELECT value FROM \"".$currentdbname."\" where id ~ '^Q' or id ~ '^U'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		array_push($entitys, $row['value']);
	}
	pg_free_result($result);
	
	
	//get info (A1)
	$sql= "SELECT value FROM \"".$currentdbname."\" where id = 'A1'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		$info= $row['value'];
	}
	pg_free_result($result);
	
	
	//get relations (D1)
	$sql= "SELECT value FROM \"".$currentdbname."\" where id = 'D1'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());

	while ($row=pg_fetch_assoc($result)) {
		$relations= $row['value'];
	}
	pg_free_result($result);
		
	




		// array json
		$arrayJson= array( "events" => $events, "entitys" => $entitys, "info"=> $info, "relations"=> $relations);	
		$data= json_encode($arrayJson);
		echo $data;
?>
