const path = require('path');
var express = require('express');
var router = express.Router();

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: `http://${process.env.LS_ELASTICSEARCH_HOST}:${process.env.LS_ELASTICSEARCH_PORT}` });

var Minio = require('minio')
var minioClient = new Minio.Client({
    endPoint: 'storage',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

var amqp = require('amqplib');

const { Transform } = require('stream');

/* POST sync the document bucket with elasticsearch
* Basically do a loop of all files in the bucket and ensure they all exist in elasticsearch
*   */
router.post('/bucket', function (req, res, next) {
    let items = [];
    var stream = minioClient.listObjects('documents','', true)
        .pipe(new BatchTransform({batchSize:10}))
        .pipe(new ElasticSearchMissingFilesTransform())
        .pipe(new BatchTransform())
        .pipe(new PublishMissingTransform())

    stream.on('data', function(data){
        items = items.concat(data);
    })
    stream.on('error', function(err) { console.log(err) } );
    stream.on('end', async function() {
        console.log("END:", items)
        res.send(items);
    });


});


/* POST sync a specific with elasticsearch (update operation)
 * Should regenerate missing thumbnails as well
 */
router.get('/file', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, '../public/index.html') )
});

module.exports = router;



// private methods for stream handling
// https://www.bennadel.com/blog/3236-using-transform-streams-to-manage-backpressure-for-asynchronous-tasks-in-node-js.htm
// https://www.ramielcreations.com/the-hidden-power-of-node-js-streams/
// https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream

class BatchTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.batchSize = options.batchSize || 5;
        this.batchBuffer = [];


    }
    _transform(item, encoding, done) {
        this.batchBuffer.push( item );

        // If our batch buffer has reached the desired size, push the batched
        // items onto the READ buffer of the transform stream.
        if ( this.batchBuffer.length >= this.batchSize ) {

            this.push( this.batchBuffer );

            // Reset for next batch aggregation.
            this.batchBuffer = [];
        }

        done();
    }
    _flush(done){
        // It's possible that the last few items were not sufficient (in count)
        // to fill-out an entire batch. As such, if there are any straggling
        // items, push them out as the last batch.
        if ( this.batchBuffer.length ) {

            this.push( this.batchBuffer );

        }

        done();
    }
}

class ElasticSearchMissingFilesTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.index = options.index || 'lodestone';
        this.storageBucket = options.storageBucket || 'documents';
    }
    async _transform(batch, encoding, done) {

        var batchBody = []

        for(let fileInfo of batch){
            batchBody.push({}) // empty index object
            batchBody.push({
                "_source": ["storage", "file"],
                query: {
                    bool: {
                        must: [
                            {
                                "match": { "storage.bucket": this.storageBucket }
                            },
                            {
                                "match": { "storage.path": fileInfo.name }
                            }
                        ]
                    }
                }
            })
        }

        const batchSearchResults  = await client.msearch({
            index: this.index,
            // max_concurrent_shard_requests: 10,
            body: batchBody
        });

        for(var ndx = 0; ndx < batchSearchResults.body.responses.length; ndx++){
        // for(let [batchResult, index] of batchSearchResults.body.responses){
            var batchResult = batchSearchResults.body.responses[ndx];
            if(batchResult.hits.hits.length === 0){
                //this file was not found in elasticsearch
                this.push({
                    bucket: this.storageBucket,
                    path: batch[ndx].name
                })
            }
        }
        done()
    }
}

class PublishMissingTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.storageBucket = options.storageBucket || 'documents';

        this.rabbitmqClient = amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.LS_RABBITMQ_HOST}:${process.env.LS_RABBITMQ_PORT}`)
            .then(function(conn) {
                return conn.createChannel();
            })
    }
    async _transform(batch, encoding, done) {
        var delgate = this;
        this.rabbitmqClient
            .then(function(ch) {

                var promiseList = []
                for(let storageInfo of batch){
                    console.log("RRABBITMQ DOCS",storageInfo)
                    var payload = {
                        "Records":[
                            {
                                "eventVersion":"2.0",
                                "eventSource":"lodestone:publisher:web-sync",
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
                                        "name": storageInfo.bucket,
                                        "ownerIdentity":{
                                            "principalId":"lodestone"
                                        },
                                        "arn": `arn:aws:s3:::${storageInfo.bucket}`
                                    },
                                    "object":{
                                        "key": storageInfo.path,
                                        "size": 0,
                                        "eTag":"eTag",
                                        "versionId":"1"
                                    }
                                }
                            }
                        ]
                    }
                    promiseList.push(ch.publish('lodestone', 'documents', Buffer.from(JSON.stringify(payload)), {contentType:'application/json'}));
                }
                delgate.push(batch)
                return Promise.all(promiseList)
            })
            .catch(console.warn)
            .finally(function(){done()})
    }
}
