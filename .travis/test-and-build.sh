# !/bin/bash
#
# Test and build Ember app, failing on any step that errors

set -e

npm test
npm run build -- --environment=production
