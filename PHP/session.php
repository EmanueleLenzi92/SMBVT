
<?php



session_start();// Starting Session

//delete sessiondemo to be able to "IN PRODUCTION" to real database
if(isset($_SESSION['Demon_on'])){
	session_destroy ();
}

//DB POSTGRES
require('PgConn.php');


// variable for username (used for build tables)
$user_check="";

// variable for username (used to be displayed in menu)
$usernameToDisplayInMenu= "";

if(isset($_SESSION['login_user'])){
	
	// get username to display in menu (i'ts equals to usernames for our users; is different for vre users)
	$usernameToDisplayInMenu= $_SESSION['username_to_display'];

	// Storing Session
	//$user_check=$_SESSION['login_user']; 
	$user_check= str_replace("-","",$_SESSION['login_user']);
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
	$query = "select id, title, subject, copied_from from narrations where \"user\"= '".$_SESSION['id_user']."' order by id desc";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
			
	while ($row = pg_fetch_row($result)) {
		array_push($arr,$row);
	}
	pg_free_result($result);
	
	
	
}



 

		// array json
		$arrayJson= array( "username" => $user_check, "usernameToDisplayInMenu"=>$usernameToDisplayInMenu, "jsonData" => $arr);		
		$data= json_encode($arrayJson);
		echo $data;
?>
