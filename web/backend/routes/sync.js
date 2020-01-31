const path = require('path');
var express = require('express');
var router = express.Router();
var Minio = require('minio')

var minioClient = new Minio.Client({
    endPoint: 'storage',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

/* POST sync the document bucket with elasticsearch
* Basically do a loop of all files in the bucket and ensure they all exist in elasticsearch
*   */
router.get('bucket', function(req, res, next) {
    var stream = minioClient.listObjects('documents','', true);
    stream.on('data', function(obj) { res.json(obj) } );
    stream.on('error', function(err) { console.log(err) } );
});


/* POST sync a specific with elasticsearch (update operation)
 * Should regenerate missing thumbnails as well
 */
router.get('file', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, '../public/index.html') )
});

module.exports = router;
