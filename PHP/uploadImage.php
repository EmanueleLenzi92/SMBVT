
<?php
require('PgConn.php');

// move the blob file (passed by loadImageFromFile js function) in the images folder
move_uploaded_file(
    $_FILES['file']['tmp_name'], 
    "../images/".$_POST['fileName']
); 

chmod("../images/".$_POST['fileName'], 0777);
