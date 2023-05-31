<?php
session_start();

if(isset($_SESSION['Demon_on'])){
	require('../../../conn/PgConnDemo.php');
} else {
	
	require('../../../conn/PgConn.php');

}
	
?>