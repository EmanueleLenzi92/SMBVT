
<?php
//DB POSTGRES
require('PgConn.php');


session_start();// Starting Session
$user_check="";
$allDbName=[];
if(isset($_SESSION['login_user'])){
	
	//get dbName (userName-idWikiSubjectNarration)
	$dbName= $_POST['dbN'];
	
	//get only subjectNarration
	$arrayDbName= explode("-",$dbName);
	$subjectNarration= $arrayDbName[1];
	
	//get idNarra (can be "null" or integer)
	$idNarra= $_POST['idNarra'];

	// GET USER
	$user_check=$_SESSION['login_user'];
	$sql= "SELECT username FROM users where username= '".$user_check."'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());



	
	
	// If idNarration is null, it's NEW narration. Has to insered in DB. Else, idNarration remains id of a existing narration passed with URL query in JS
	if($idNarra == null){
		
		$sql= "WITH ins AS (INSERT INTO narrations (id_dbname, title, \"user\", subject) VALUES ('".$dbName."', '".$subjectNarration."', '".$_SESSION['id_user']."', '".$subjectNarration."') RETURNING id_dbname) select count(*) from ins";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		
		
		pg_free_result($result);
		
		$sql= "SELECT last_value FROM id_narration_seq";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		while ($row = pg_fetch_row($result)) {
			$idNarra=$row[0];
		}
		pg_free_result($result);
	} 	
			
	
	// get all narrations of this user
	$query = "select id, title, subject from narrations where \"user\"= '".$_SESSION['id_user']."'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
			
	while ($row = pg_fetch_row($result)) {
		array_push($allDbName,$row);
	}
	pg_free_result($result);
	
}


		// array json
		$arrayJson= array( "username" => $user_check, "allDBName" => $allDbName, "idNarra" => $idNarra);		
		$data= json_encode($arrayJson);
		echo $data;
?>
