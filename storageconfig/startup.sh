#!/usr/bin/env sh

mc --version

# authenticate to minio storage
mc config host add minio http://storage:9000 ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY} --api S3v4

# Set public readonly bucket policy on  buckets
mc policy set download minio/thumbnails
mc policy set download minio/documents

# Set event watcher on documents bucket


