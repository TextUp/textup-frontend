#!/bin/bash
#
# Deploy Ember app to S3 bucket of choice

app_path=$1
bucket_name=$2

aws s3 sync ${app_path} s3://${bucket_name} --only-show-errors --size-only --delete --exclude "index.html"
aws s3 sync ${app_path} s3://${bucket_name} --only-show-errors --size-only --exclude "*" --include "index.html" --cache-control 'max-age=180'
