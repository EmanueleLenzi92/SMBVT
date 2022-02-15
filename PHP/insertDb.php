
<?php
//DB POSTGRES
require('PgConn.php');

	//$evId= $_POST['EvId'];
	$msg="nessuna query di inserimento o modifica al DB";
	$objclist= pg_escape_string($_POST['objclist']);
	$objcid= $_POST['objcid'];
	$dbname= $_POST['dbname'];
	$dbuser= $_POST['dbuser'];
	$idNarra= $_POST['idNarra'];
	$rows = 0;




	$sql= "SELECT id FROM \"".$idNarra.$dbuser."-".$dbname."\" WHERE id = '" . $objcid . "'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	$rows = pg_num_rows($result);
	
	if($rows == 1){
		$sql2= "UPDATE \"".$idNarra.$dbuser."-".$dbname."\" SET value = '". $objclist . "' WHERE id= '" . $objcid . "'";
		$result2 = pg_query($sql2) or die('Error message: ' . pg_last_error()); 
		
		if (substr( $objcid, 0, 1 ) === "Q" or substr( $objcid, 0, 1 ) === "U") { 
			$msg= "entità " . $objcid . " aggiornata";
		} else if (substr( $objcid, 0, 2 ) === "ev"){
			$msg= "evento " . $objcid . " aggiornato";
		} else if ($objcid == "D1") {
			$msg= "relazione D1 " . $objcid . " aggiornata";
		} else if($objcid == "A1"){
			$msg= "info A1 " . $objcid . " aggiornata";
		}
		
		
	} else {
		
		$sql2= "INSERT INTO \"".$idNarra.$dbuser."-".$dbname."\" (id, value) 
		VALUES ('" . $objcid . "', '". $objclist . "')";
		$result2 = pg_query($sql2) or die('Error message: ' . pg_last_error());
		
		if (substr( $objcid, 0, 1 ) === "Q" or substr( $objcid, 0, 1 ) === "U") { 
			$msg= "nuova entità " . $objcid . " inserita";
		} else if (substr( $objcid, 0, 2 ) === "ev"){
			$msg= "nuovo evento " . $objcid . " inserito";
		} else if ($objcid == "D1") {
			$msg= "nuova relazione " . $objcid . " inserita";
		} else if($objcid == "A1"){
			$msg= "nuova info A1 " . $objcid . " inserita";
		}
	
	}


		
		pg_free_result($result);
		pg_free_result($result2);
	
	
	

		// array json
		$arrayJson= array( "msg" => $msg);	
		$data= json_encode($arrayJson);
		echo $data;
?>
