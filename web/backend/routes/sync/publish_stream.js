const { Transform } = require('stream');
var amqp = require('amqplib');


class PublishBatchMissingTransform extends Transform {
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
                    var payload = {
                        "Records":[
                            {
                                "eventVersion":"2.0",
                                "eventSource":"lodestone:publisher:web-sync-all",
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
                                        "key": storageInfo.key,
                                        "size": storageInfo.size,
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

module.exports.PublishBatchMissingTransform = PublishBatchMissingTransform;
