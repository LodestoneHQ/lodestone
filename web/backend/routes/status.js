var express = require('express');
var router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elasticsearch:9200' });

/* GET status listing. */
router.get('/', async function(req, res, next) {
    try {
        res.json({
            frontend: {
                sha: ''
            },
            backend: {
                sha: ''
            },
            elasticsearch: {
                ping: await client.ping().then(() => { return "ok" }).catch((error) => { return error }),
                health: await client.cluster.health(),
            }
        })
    } catch (error) {
        next(error);
    }
});


module.exports = router;
