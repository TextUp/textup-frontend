#!/bin/bash
#
# Deploy Ember app to S3 bucket of choice, preserving correct MIME type

app_path=$1
bucket_name=$2

s3cmd sync ${app_path}/assets/*.css "s3://${bucket_name}/assets/" --mime-type=text/css
s3cmd sync ${app_path}/assets/*.js "s3://${bucket_name}/assets/" --mime-type=application/javascript
s3cmd sync ${app_path}/ "s3://${bucket_name}" --exclude=index.html
s3cmd sync ${app_path}/index.html "s3://${bucket_name}/index.html" --add-header='Cache-Control:max-age=180'
s3cmd sync ${app_path}/ "s3://${bucket_name}" --delete-removed --exclude=favicon.ico
