
<?php
//DB POSTGRES
require('PgConn.php');


session_start();// Starting Session
$user_check="";
if(isset($_SESSION['login_user'])){

	// Storing Session
	$user_check=$_SESSION['login_user'];
	// SQL Query To Fetch Complete Information Of User
	$sql= "SELECT username FROM users where username= '".$user_check."'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());


	while ($row=pg_fetch_assoc($result)) {
		$login_session = $row['username'];
	}
	pg_free_result($result);
}


$arr=[];
if($user_check != ""){
	

	// get all narrations of this user
	$query = "select id, title, subject from narrations where \"user\"= '".$_SESSION['id_user']."'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
			
	while ($row = pg_fetch_row($result)) {
		array_push($arr,$row);
	}
	pg_free_result($result);
	
	
	
}





		// array json
		$arrayJson= array( "username" => $user_check, "jsonData" => $arr);		
		$data= json_encode($arrayJson);
		echo $data;
?>
