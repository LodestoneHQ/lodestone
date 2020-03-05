const { Transform, Readable } = require('stream');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: `http://${process.env.LS_ELASTICSEARCH_HOST}:${process.env.LS_ELASTICSEARCH_PORT}` });
const Document = require('./model/document');

// loop though fileInfos sent in batch. For each fileInfo, check if file exists in ElasticSearch.
// if ElasticSearch entry does not exist, create a Document model, and add it to the stream to continue processing.
class ElasticSearchBatchFindMissingTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.index = options.index || 'lodestone';
        this.storageBucket = options.storageBucket || 'documents';
    }
    async _transform(batch, encoding, done) {

        //strip out any "files" from the batch that are size 0, or have a filepath that ends in '/'
        batch = batch.filter(function(fileInfo){
            console.log("Processing", fileInfo);
            if(fileInfo.size === 0){
                console.log("Ignoring:", fileInfo);
                return false
            }
            else if(fileInfo.name.charAt(fileInfo.name.length - 1) === '/'){
                console.log("Ignoring:", fileInfo);
                return false
            }
            else {
                return true
            }
        })

        var batchBody = [];

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
                this.push(new Document(
                    null,
                    this.storageBucket,
                    batch[ndx].name,
                    batch[ndx].size,
                    batch[ndx].lastModified,
                    '',
                    'MISSING_ELASTICSEARCH'
                ))
            }
        }
        done()
    }
}

// collect each Document models in batch, issue a bulk deletion operation.
class ElasticSearchBatchDeleteTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.index = options.index || 'lodestone';
    }
    async _transform(batch, encoding, done) {

        var batchBody = [];

        for(let document of batch){
            batchBody.push({ "delete" : { "_index" : this.index, "_id" : document.elasticSearchId } })
        }

        const batchDeleteResponse  = await client.bulk({
            body: batchBody
        });

        if (batchDeleteResponse.errors) {
            console.log("Error(s) occurred while deleting documents", batchDeleteResponse.errors)
        }

        for(let document of batch){
            this.push(document)
        }
        done()
    }
}


// retrieve all entries from ElasticSearch
// paginate, and convert each individual entry into a Document model and add to stream.
class ElasticSearchQueryReadable  extends Readable {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);

        this.query = options.query || {}; //get all
        this.index = options.index || 'lodestone';

        this.pageSize = 20;
        this.currentPage = 0;

        this.complete = false;
    }

    async _read() {

        if(this.complete){
            this.push(null); //retrieved all data from Elasticsearch, close stream
            return
        }

        try {
            const searchResults  = await client.search({
                index: this.index,
                from: this.pageSize * this.currentPage,
                size: this.pageSize,
                body: this.query
            })

            this.currentPage++;

            // console.log(JSON.stringify(searchResults));
            console.log(searchResults.body.hits.hits.length);

            if(searchResults.body.hits.hits.length === 0 || searchResults.body.hits.hits.length < this.pageSize){
                this.complete = true
            }

            for(let entry of searchResults.body.hits.hits){
                this.push(new Document(
                    entry._id,
                    entry._source.storage.bucket,
                    entry._source.storage.path,
                    entry._source.file.filesize,
                    entry._source.file.last_modified,
                    entry._source.content.trim(),
                    null
                ))
            }
        }
        catch(e){
            throw e
        }
    }
}


// for each Document models in stream, select entries where content is missing or only whitespace. (we should re-process)
class ElasticSearchFindEmptyExtractTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.index = options.index || 'lodestone';
    }
    async _transform(document, encoding, done) {

        if(!document.content || document.content.trim().length === 0){
            document.syncStatus = 'MISSING_EXTRACTED_TEXT';
            this.push(document);
        }
        done()
    }
}


module.exports.ElasticSearchBatchFindMissingTransform = ElasticSearchBatchFindMissingTransform;
module.exports.ElasticSearchBatchDeleteTransform = ElasticSearchBatchDeleteTransform;
module.exports.ElasticSearchQueryReadable = ElasticSearchQueryReadable;
module.exports.ElasticSearchFindEmptyExtractTransform = ElasticSearchFindEmptyExtractTransform;
