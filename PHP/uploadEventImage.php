<?php
require('PgConn.php');



    if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }
    else {
        move_uploaded_file($_FILES['file']['tmp_name'], "../images/".$_POST['imgName']);
		chmod("../images/".$_POST['imgName'], 0777);
    }

?>