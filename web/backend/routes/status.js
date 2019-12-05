var express = require('express');
var router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elasticsearch:9200' });
const fetch = require('node-fetch');

/* GET status listing. */
router.get('/', async function(req, res, next) {
    try {

        var rabbitmq = await fetch('http://lodestone:lodestone@rabbitmq:15672/api/queues')
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
