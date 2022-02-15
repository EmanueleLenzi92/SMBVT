
<?php
//DB POSTGRES
require('PgConn.php');

	$objcid= $_POST['objId'];
	$dbname= $_POST['dbname'];
	$dbuser= $_POST['dbuser'];
	$dbIdNarra = $_POST['dbIdNarra'];
	$msg="Nessuna eliminazione";
	$rows = 0;




	$sql= "SELECT id FROM \"".$dbIdNarra.$dbuser."-".$dbname."\" WHERE id = '" . $objcid . "'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	$rows = pg_num_rows($result);

	if($rows == 1){
		
		$sql2= "DELETE FROM \"".$dbIdNarra.$dbuser."-".$dbname."\" WHERE id = '" . $objcid . "'";
		$result2 = pg_query($sql2) or die('Error message: ' . pg_last_error());
		
		if (substr( $objcid, 0, 1 ) === "Q" or substr( $objcid, 0, 1 ) === "U") { 
			$msg= "entità " . $objcid . " eliminata";
		} else if (substr( $objcid, 0, 2 ) === "ev"){
			$msg= "evento " . $objcid . " eliminato";
		} else if ($objcid == "D1") {
			$msg= "relazione D1 " . $objcid . " eliminata";
		} else if($objcid == "A1"){
			$msg= "info A1 " . $objcid . " eliminata";
		}

		pg_free_result($result2);
			
		
	} 

	pg_free_result($result);

	

		// array json
		$arrayJson= array( "msg" => $msg);	
		$data= json_encode($arrayJson);
		echo $data;
?>
