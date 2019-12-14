var express = require('express');
var router = express.Router();
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch:9200' })

/* Get */
router.post('/get', async function(req, res, next) {
    let resp;
    try {
        resp = await client.get(req.body)
    } catch(e){
        console.log(e)

    } finally {
        res.send(resp.body);
    }
});

/* Search */
router.post('/search', async function(req, res, next) {
    let resp;
    try {
        resp = await client.search(req.body)
    } catch(e){
        console.log(e)
        resp = {body: e}
    } finally {
        res.send(resp.body);
    }

});

/* Update */
router.post('/update', async function(req, res, next) {
    let resp;
    try {
        resp = await client.update(req.body)
    } catch(e){
        console.log(e)
        resp = {body: e}
    } finally {
        res.send(resp.body);
    }
});

router.post('/ping', async function(req, res, next) {
    let resp;
    try {
        resp = await client.ping(req.body)
    } catch(e){
        console.log(e)
        resp = {body: e}

    } finally {
        res.send(resp.body);
    }
});


module.exports = router;
