# !/bin/bash
#
# Test and build Ember app, failing on any step that errors

set -e

yarn lint:js
yarn test
yarn build --environment=production
