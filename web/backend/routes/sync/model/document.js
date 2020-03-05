class Document {
    constructor(elasticSearchId, bucket, key, fileSize, lastModified, content, syncStatus) {

        //storage entries
        this.bucket = bucket;
        this.key = key;
        this.size = fileSize;
        this.lastModified = lastModified;

        //elasticsearch meta
        this.content = content;
        this.elasticSearchId = elasticSearchId

        // syncStatus must be one of the following states = ['MISSING_ELASTICSEARCH', 'MISSING_STORAGE', 'MISSING_EXTRACTED_TEXT', null]
        this.syncStatus = null
    }
}

module.exports = Document;
