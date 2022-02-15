#!/usr/bin/python
# -*- coding: utf-8 -*-

import cgi, cgitb, os, sys


UPLOAD_DIR = '/var/www/'

def save_uploaded_file():
    print 'Content-Type: text/html; charset=UTF-8'
    print
    print '''
<html>
<head>
  <title>Upload File</title>
</head>
<body>
'''

    form = cgi.FieldStorage()
    if not form.has_key('file'):
        print '<h1>Parameter "file" is missing</h1>'
        return

    if not form.has_key('fileName'):
        print '<h1>Parameter "fileName" is missing</h1>'
        return
    
    uploaded_file_path = os.path.join(UPLOAD_DIR, os.path.basename(str(form.getvalue('fileName'))))

    with open(uploaded_file_path, 'wb') as fout:
        
        chunk = form.getvalue('file')        
        fout.write (chunk)

    print '<h1>Completed file upload</h1>'

    print '''
<hr>
<a href="../upload.html">Back to upload page</a>
</body>
</html>
'''


cgitb.enable()
save_uploaded_file()
