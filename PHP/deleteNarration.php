
<?php
//DB POSTGRES
require('PgConn.php');

	
	$dbname= $_POST['subject'];
	$dbuser= $_POST['user'];
	$dbIdNarra = $_POST['id'];
	$msg="deleted narration: " . $dbIdNarra . $dbuser . $dbname;





	$sql= "DROP TABLE \"".$dbIdNarra.$dbuser."-".$dbname."\"";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	$rows = pg_num_rows($result);
	
	$sql= "DELETE FROM narrations WHERE id = " . $dbIdNarra;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	$rows = pg_num_rows($result);


	

		// array json
		$arrayJson= array( "msg" => $msg);	
		$data= json_encode($arrayJson);
		echo $data;
?>
