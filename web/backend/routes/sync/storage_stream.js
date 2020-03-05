var Minio = require('minio')
var minioClient = new Minio.Client({
    endPoint: process.env.LS_STORAGE_HOST,
    port: parseInt(process.env.LS_STORAGE_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const { Transform, Readable } = require('stream');

//get all files from Storage
function StorageListFiles(){
    return minioClient.listObjects('documents','', true);
}

//check each entry, and see if it's associated filesystem file still exists. If not, delete from Elasticsearch.
// all
class StorageFindMissingTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
    }
    async _transform(document, encoding, done) {
        var delegate = this;
        await minioClient.statObject(document.bucket, document.key)
            .then(function(stat){
                //fileInfo was retrieved successfully, this file exists. Ignore.
                console.log(stat);
                return
            })
            .catch(function(err){
                console.log("An error occurred while retrieving file from storage. If this file is missing, this is expected");
                document.syncStatus = 'MISSING_STORAGE';
                delegate.push(document);
            })
            .finally(function(){
                return done();
            })
    }
}

module.exports.StorageListFiles = StorageListFiles;
module.exports.StorageFindMissingTransform = StorageFindMissingTransform;
