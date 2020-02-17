var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var _ = require('lodash');

var s3  = new AWS.S3({
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
    endpoint: `http://${process.env.LS_STORAGE_HOST}:${process.env.LS_STORAGE_PORT}` ,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4'
});

AWS.Request.prototype.forwardToExpress = function forwardToExpress(res, next) {
    this
        .on('httpHeaders', function (code, headers) {
            if (code < 300) {
                res.set(_.pick(headers, 'content-type', 'content-length', 'last-modified'));
            }
        })
        .createReadStream()
        .on('error', next)
        .pipe(res);
};

/* GET file from minio, authentication handled server-side. Since minio is not exposed, and buckets
 are still protected via access/secret key its better protected.  */
//https://stackoverflow.com/questions/35782434/streaming-file-from-s3-with-express-including-information-on-length-and-filetype
router.get('/:bucket/*', function(req, res, next) {
    s3.getObject({Bucket: req.params.bucket, Key: req.params['0']})
        .forwardToExpress(res, next);
});

/* POST file to minio, authentication handled server-side. Since minio is not exposed, and buckets
 are still protected via access/secret key its better protected.  */
router.post('/:bucket/*', function(req, res, next) {

    const params = {
        Bucket: req.params.bucket,
        Key: req.params['0'],
        Body: req, //req is a stream
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if(err){
            res.send('Error Uploading Data: ' + JSON.stringify(err) + '\n' + JSON.stringify(err.stack));

        } else {
            console.log(`File uploaded successfully. ${data.Location}`);
            res.json({"status":"success"})
        }
    });
});


/* POST file to minio, authentication handled server-side. Since minio is not exposed, and buckets
 are still protected via access/secret key its better protected.  */
router.delete('/:bucket/*', function(req, res, next) {

    const params = {
        Bucket: req.params.bucket,
        Key: req.params['0'],
    };

    // Uploading files to the bucket
    s3.deleteObject(params, function(err, data) {
        if(err){
            res.send('Error Deleting Data: ' + JSON.stringify(err) + '\n' + JSON.stringify(err.stack));

        } else {
            console.log(`File deleted successfully. ${data.Location}`);
            res.json({"status":"success"})
        }
    });
});



module.exports = router;
