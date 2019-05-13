# !/bin/bash
#
# Deploy Ember app to S3 bucket of choice

app_path=$1
bucket_name=$2
cloudfront_id=$3

echo "Synchronizing files..."
aws s3 sync ${app_path} s3://${bucket_name} --size-only --delete --exclude "index.html"
# don't want the size-only flag when syncing index html because this file is
# likely does NOT have a has behind it and is likely the same size. Therefore, if we
# added in the `--size-only` flag, this file would not be synchronized even though the
# previous assets have been deleted, leading to a broken app where the html file points
# to older assets that have already been deleted
aws s3 sync ${app_path} s3://${bucket_name} --exclude "*" --include "index.html" --cache-control "max-age=180"
aws s3 sync ${app_path} s3://${bucket_name} --exclude "*" --include "manifest.appcache"
echo "...done"

if [ ${cloudfront_id} ]
then
    echo "Triggering cache invalidation..."
    aws cloudfront create-invalidation --distribution-id ${cloudfront_id} --paths "/*"
    echo "...done"
else
    echo "Skipping cache invalidation"
fi
