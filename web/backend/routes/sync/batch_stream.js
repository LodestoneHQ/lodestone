const { Transform } = require('stream');

class BatchTransform extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true
        super(options);
        // By default we are in object mode but this can be overwritten by the user
        this.batchSize = options.batchSize || 5;
        this.batchBuffer = [];


    }
    _transform(item, encoding, done) {
        this.batchBuffer.push( item );

        // If our batch buffer has reached the desired size, push the batched
        // items onto the READ buffer of the transform stream.
        if ( this.batchBuffer.length >= this.batchSize ) {

            this.push( this.batchBuffer );

            // Reset for next batch aggregation.
            this.batchBuffer = [];
        }

        done();
    }
    _flush(done){
        // It's possible that the last few items were not sufficient (in count)
        // to fill-out an entire batch. As such, if there are any straggling
        // items, push them out as the last batch.
        if ( this.batchBuffer.length ) {

            this.push( this.batchBuffer );

        }

        done();
    }
}
module.exports.BatchTransform = BatchTransform;
