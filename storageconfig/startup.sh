#!/usr/bin/env sh

mc --version

# authenticate to minio storage
mc config host add minio http://storage:9000 ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY} --api S3v4
mc admin info server minio

# Set public readonly bucket policy on  buckets
mc policy set download minio/thumbnails
mc policy set download minio/documents

# Set event watcher on documents bucket
mc event add  minio/documents arn:minio:sqs::1:redis
mc event list minio/documents


