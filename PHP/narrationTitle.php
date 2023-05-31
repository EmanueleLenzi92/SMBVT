
<?php
//DB POSTGRES
require('PgConn.php');


if(isset($_GET['dbusername'])){
	
	// GET TITLE NARRATION IN "A1 -> name"
	
	$dbName= $_GET['dbusername'];
	$idNarra= $_GET['idNarra'];
	$firstTitleSubjNarration= $_GET['firstTitle'];

	$sql= "SELECT value::jsonb->>'name' as titlejs FROM \"".$idNarra.$dbName."\" where id = 'A1'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());


	while ($row=pg_fetch_assoc($result)) {
		$title = $row['titlejs'];
	}
	pg_free_result($result);

	
	//Update title in narrations table (first time is ""; so it will be title of sibject narration)
	
	if($title == ""){
		$sql="UPDATE \"".$idNarra.$dbName."\" SET value= jsonb_set(value, '{name}', '\"$firstTitleSubjNarration\"') where id='A1'"; //update A1.info in db
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		pg_free_result($result);
		
		$sql= "UPDATE narrations SET title='$firstTitleSubjNarration' where id= $idNarra"; //update title in narrations table
	
	} else {$sql= "UPDATE narrations SET title='".pg_escape_string($title)."' where id= $idNarra";}
	
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	pg_free_result($result);
	
	
	// array json
	$arrayJson= array( "title" => $title);		
	$data= json_encode($arrayJson);
	echo $data;

} else if (isset($_POST['dbusername'])){

	//UPDATE TITLE NARRATION IN "A1 -> name"
	
	$idNarra= $_POST['idNarra'];
	$dbName= $_POST['dbusername'];
	$newTitle= json_encode(pg_escape_string($_POST['newtitle']));
	
	$sql= "UPDATE \"".$idNarra.$dbName."\" SET value= jsonb_set(value, '{name}', '$newTitle') WHERE id = 'A1'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	pg_free_result($result);

	//Update title in narrations table
	$sql= "UPDATE narrations SET title='$newTitle' where id= $idNarra";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());

	pg_free_result($result);
	
	
	
	
	
	// array json
	$arrayJson= array( "msg" => "ok");		
	$data= json_encode($arrayJson);
	echo $data;

}



?>
