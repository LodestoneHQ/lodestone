const path = require('path');
var express = require('express');
var router = express.Router();
var mergeStream = require('merge-stream');

var amqp = require('amqplib');


var BatchTransform = require('./sync/batch_stream').BatchTransform;
var PublishBatchMissingTransform = require('./sync/publish_stream').PublishBatchMissingTransform;
var ElasticSearchBatchFindMissingTransform = require('./sync/elasticsearch_stream').ElasticSearchBatchFindMissingTransform;
var ElasticSearchBatchDeleteTransform = require('./sync/elasticsearch_stream').ElasticSearchBatchDeleteTransform;
var ElasticSearchQueryReadable = require('./sync/elasticsearch_stream').ElasticSearchQueryReadable;
var ElasticSearchFindEmptyExtractTransform = require('./sync/elasticsearch_stream').ElasticSearchFindEmptyExtractTransform;
var StorageFindMissingTransform = require('./sync/storage_stream').StorageFindMissingTransform;
var StorageListFiles = require('./sync/storage_stream').StorageListFiles;

/* POST sync the document bucket with elasticsearch
* Basically, we want to ensure that elasticsearch is in sync with the files in the filesystem. We do this with the following algorithms:
* - do a loop of all files in the bucket and ensure they all exist in elasticsearch
* - loop though all entries in elasticsearch:
*   - delete the elasticsearch entry if the file no longer exists
*   - re-trigger processing on any entries that have empty content
*   */
router.post('/bucket', function (req, res, next) {
    var esMissingStream = StorageListFiles()
        .pipe(new BatchTransform({batchSize:10}))
        .pipe(new ElasticSearchBatchFindMissingTransform())
        .pipe(new BatchTransform())
        .pipe(new PublishBatchMissingTransform());

    var esStream = new ElasticSearchQueryReadable();
    var storageMissingStream = esStream
        .pipe(new StorageFindMissingTransform())
        .pipe(new BatchTransform({batchSize:10}))
        .pipe(new ElasticSearchBatchDeleteTransform());

    var contentMissingStream = esStream
        .pipe(new ElasticSearchFindEmptyExtractTransform())
        .pipe(new BatchTransform({batchSize:10}))
        .pipe(new PublishBatchMissingTransform())


    var resultStream = mergeStream(esMissingStream, storageMissingStream, contentMissingStream)

    var items = [];
    resultStream.on('data', function(data){
        // console.log("GOT", data)
        items = items.concat(data);
    })
    resultStream.on('error', function(err) { console.log(err); next(err) } );
    resultStream.on('end', async function() {
        console.log("END:", items)
        res.send(items);
    });

});


/* POST sync a specific with elasticsearch (update operation)
 * Should regenerate missing thumbnails as well
 */
router.post('/file/:bucket/*', function(req, res, next) {
    const params = {
        Bucket: req.params.bucket,
        Key: req.params['0'],
    };

    amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.LS_RABBITMQ_HOST}:${process.env.LS_RABBITMQ_PORT}`)
        .then(function(conn) {
            return conn.createChannel();
        })
        .then(function(chan){
            var payload = {
                "Records":[
                    {
                        "eventVersion":"2.0",
                        "eventSource":"lodestone:publisher:web-sync-document",
                        "awsRegion":"",
                        "eventTime": (new Date()).toISOString(),
                        "eventName": "s3:ObjectCreated:Put",
                        "userIdentity":{
                            "principalId": "lodestone"
                        },
                        "requestParameters":{
                            "sourceIPAddress": "localhost"
                        },
                        "responseElements":{},
                        "s3":{
                            "s3SchemaVersion":"1.0",
                            "configurationId":"Config",
                            "bucket":{
                                "name": params.Bucket,
                                "ownerIdentity":{
                                    "principalId":"lodestone"
                                },
                                "arn": `arn:aws:s3:::${params.Bucket}`
                            },
                            "object":{
                                "key": params.Key,
                                "size": 0,
                                "eTag":"eTag",
                                "versionId":"1"
                            }
                        }
                    }
                ]
            };
            return chan.publish('lodestone', 'documents', Buffer.from(JSON.stringify(payload)), {contentType:'application/json'});
        })
        .catch(function(err){console.warn(err); next(err);})
        .finally(function(){
            res.send({"status":"success"})
        });
});

module.exports = router;



// private methods for stream handling
// https://www.bennadel.com/blog/3236-using-transform-streams-to-manage-backpressure-for-asynchronous-tasks-in-node-js.htm
// https://www.ramielcreations.com/the-hidden-power-of-node-js-streams/
// https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream


