const path = require('path');
var express = require('express');
var router = express.Router();

/* POST sync the document bucket with elasticsearch
* Basically do a loop of all files in the bucket and ensure they all exist in elasticsearch
*   */
router.post('bucket', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, '../public/index.html') )
});


/* POST sync a specific with elasticsearch (update operation)
 * Should regenerate missing thumbnails as well
 */
router.get('file', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, '../public/index.html') )
});

module.exports = router;
