

<?php
//DB POSTGRES
require('PgConn.php');


session_start(); // Starting Session
$error=''; // Variable To Store Error Message

	if (empty($_GET['username']) || empty($_GET['passwor'])) {
	$error = "Username or Password is invalid";
	}
	else
	{
	// Define $username and $password
	$usernameAdm=$_GET['username'];

	$passwordAdm=$_GET['passwor'];



	// To protect MySQL injection for Security purpose
	$usernameAdm = stripslashes($usernameAdm);
	$passwordAdm = stripslashes($passwordAdm);
	$usernameAdm = pg_escape_string($usernameAdm);
	$passwordAdm = pg_escape_string($passwordAdm);
	$passwordAdm= md5($passwordAdm);

	// Selecting Database


	$query = "select * from users where password= '".$passwordAdm."' AND username= '".$usernameAdm."'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	while ($row = pg_fetch_row($result)) {
		$idUser=$row[0];
	}
	$numrows = pg_num_rows($result);
	
	$arr=[];
	if ($numrows == 1) {
		$_SESSION['login_user']=$usernameAdm; // Initializing Session
		$_SESSION['id_user']=$idUser;
		
		// get all narrations of this user
		$query = "select id, title, subject from narrations where \"user\"= '".$_SESSION['id_user']."'";
		$result = pg_query($query) or die('Error message: ' . pg_last_error());
				
		while ($row = pg_fetch_row($result)) {
			array_push($arr,$row);
		}
		pg_free_result($result);
		

	} else {
	$error = "Username or Password is invalid";
			
	}
		pg_close($dbconn); // Closing Connection
	} 



		
		// array json
		$arrayJson= array( "jsonData" => $arr, "error" => $error );		
		$data= json_encode($arrayJson);
		echo $data;


	

?>