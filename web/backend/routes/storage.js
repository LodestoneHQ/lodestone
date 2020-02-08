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
router.get('/:bucket*', function(req, res, next) {
    s3.getObject({Bucket: req.params.bucket, Key: req.params['0']})
        .forwardToExpress(res, next);
});

module.exports = router;
