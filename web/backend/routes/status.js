var express = require('express');
var router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: `http://${process.env.LS_ELASTICSEARCH_HOST}:${process.env.LS_ELASTICSEARCH_PORT}` })
const fetch = require('node-fetch');
var amqp = require('amqplib');

var EventEmitter = require('events');
var eventEmitter = new EventEmitter();

router.get('/errors', async function(req, res, next) {
    try{
        let queueName = 'errors';
        let exchangeName = 'errors';

        //https://stackoverflow.com/questions/47303096/how-to-get-all-messages-using-method-consume-in-lib-amqp-node
        let conn = await amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.LS_RABBITMQ_HOST}:${process.env.LS_RABBITMQ_PORT}`)
        let chan = await conn.createChannel();
        await chan.assertExchange(exchangeName, 'fanout')
        let response = await chan.assertQueue(queueName)

        let messageCount = response.messageCount


        await chan.consume(queueName, getMessage(chan, messageCount), {noAck: false}) //TODO: noAck true?
        /**
         * {noAck: false} false for not expect an acknowledgement
         */

        /**
         * declare timeout if we have problems with emit event in consume
         * we waiting when event will be emit once 'consumeDone' and promise gain resolve
         * so we can go to the next step
         */
        console.log("Waiting for all messages from queue");
        setTimeout(() => eventEmitter.emit('consumeDone', []), 10000)
        let queueMessages = await new Promise(resolve => eventEmitter.once('consumeDone', resolve))
        console.log('Finished querying all messages', queueMessages);
        chan.nackAll(true); //requeue all messages that were read. //TODO: figure out why this isnt working, instead the messages are requeued when the chan is closed.
        // await channel.nack(msg, false, true);
        res.json(queueMessages);
        await chan.close()

        function getMessage(channel, messageCount) {
            var messages = [];
            return async msg => {
                if(msg.content){
                    console.log("[*] recieved: '%s'", msg.content.toString())

                    let payload = JSON.parse(msg.content.toString())
                    messages.push({
                        source: payload.Records[0].eventSource,
                        bucket: payload.Records[0].s3.bucket.name,
                        key: payload.Records[0].s3.object.key
                    });
                }

                if (messageCount === msg.fields.deliveryTag) {
                    console.log("Finished consuiming messages")
                    // channel.reject(msg, true).then(console.log).end()

                    eventEmitter.emit('consumeDone', messages)
                }
            }

        }


    }
    catch(e){
        next(e)
    }

});

/* GET status listing. */
router.get('/', async function(req, res, next) {
    try {

        var rabbitmq = await fetch(`http://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.LS_RABBITMQ_MG_HOST}:${process.env.LS_RABBITMQ_MG_PORT}/api/queues`)
            .then(response => response.json())
            .then(rabbit => {
                console.log(Array.isArray(rabbit))
                return rabbit
            })
            .then(function(queues){
                var data = {}

                for(let queue of queues){
                    console.log(queue)
                    data[queue.name] = {
                        consumers: queue.consumers,
                        idle_since: queue.idle_since,
                        state: queue.state,
                        messages: queue.messages,
                        // message_stats: {
                        //     ack: number
                        //     deliver: number
                        // }


                    }
                }
                return data;
            })

        res.json({
            frontend: {
                sha: ''
            },
            backend: {
                sha: ''
            },
            elasticsearch: {
                ping: await client.ping().then(() => { return "ok" }).catch((error) => { return error }),
                status: await client.cluster.health().then(function(health){ return health.body.status }),
            },
            rabbitmq: rabbitmq
        })
    } catch (error) {
        next(error);
    }
});


module.exports = router;
