

<?php
//DB POSTGRES
require('PgConn.php');


session_start(); // Starting Session

//delete sessiondemo to be able to connect to real database
if(isset($_SESSION['Demon_on'])){
	session_destroy ();
}

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
		
		// username for table name
		//$_SESSION['login_user']=$usernameAdm;   
		$_SESSION['login_user']= str_replace("-","",$usernameAdm) . "." . $idUser;
		
		// username to display (i'ts equals to usernames for our users; is different for vre users)
		$_SESSION['username_to_display']=str_replace("-","",$usernameAdm) . "." . $idUser;
		
		// id of user
		$_SESSION['id_user']=$idUser;
		
		// variable if is vre user
		$_SESSION['VRE_user']= 0;
		
		// get all narrations of this user
		$query = "select id, title, subject, copied_from from narrations where \"user\"= '".$_SESSION['id_user']."' order by id desc";
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
		$arrayJson= array( "jsonData" => $arr, "error" => $error, "usernameToDisplayInMenu"=> $_SESSION['username_to_display'] );		
		$data= json_encode($arrayJson);
		echo $data;


	

?>