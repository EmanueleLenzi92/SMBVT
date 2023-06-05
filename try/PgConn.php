<?php
//DB POSTGRES CONN
$dbhost = 'localhost';
$dbname='';
$dbuser = '';
$dbpass ="";

$dbconn = pg_connect("host=$dbhost dbname=$dbname user=$dbuser password=$dbpass")
    or die('Could not connect: ' . pg_last_error());
?>