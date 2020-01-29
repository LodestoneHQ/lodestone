var express = require('express');
var router = express.Router();
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch:9200' })

/* Get */
router.post('/get', async function(req, res, next) {
    let resp;
    try {
        resp = await client.get(req.body)
        res.send(resp.body);
    } catch(e){
        console.log("An error occurred", e)
        next(e)
    }
});

/* Search */
router.post('/search', async function(req, res, next) {
    let resp;
    try {
        resp = await client.search(req.body)
        res.send(resp.body);
    } catch(e){
        console.log("An error occurred", e)
        next(e)
    }

});

/* Update */
router.post('/update', async function(req, res, next) {
    let resp;
    try {
        resp = await client.update(req.body)
        res.send(resp.body);

    } catch(e){
        console.log("An error occurred", e)
        next(e)
    }
});

router.post('/ping', async function(req, res, next) {
    let resp;
    try {
        resp = await client.ping(req.body)
        res.send(resp.body);

    } catch(e){
        console.log("An error occurred", e)
        next(e)
    }
});


module.exports = router;
