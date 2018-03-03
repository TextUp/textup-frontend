# Textup Frontend

[![Build Status](https://travis-ci.org/TextUp/textup-frontend.svg?branch=master)](https://travis-ci.org/TextUp/textup-frontend)

This is the frontend Ember app that connects to the [TextUp Grails backend](https://github.com/TextUp/textup-backend).

## Installation

* Ensure that the following pre-requisites are fulfilled
    * `node` LTS Argon: install with `nvm`
    * `yarn`: install with `npm install --global yarn`
    * `bower`: install with `yarn global add bower`
* Clone the repository.
    * `git clone --recursive <repository-url>` to also associate the [core styles](https://github.com/TextUp/textup-styles) repo. See [`git subtree`](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt) for more details.
    * `git remote add styles git@github.com:TextUp/textup-styles.git` to create a remote to the core styles repository for easier pulling/pushing later on
* `yarn install --ignore-engines`
* `bower install`

## Environment variables

In order to successfully build, certain environment variables are accessed in `config/environment.js`. These variables are:

* `API_GOOGLE_RECAPTCHA`
* `API_MAPBOX`
* `API_PUSHER`
* `HOST_PRODUCTION`
* `HOST_STAGING`

The host environment variables are used during the Travis CI build to determine if the built assets should be deployed to the staging or production environment. Note that Travis also requires

* `AWS_ACCESS_KEY_ID`
* `AWS_DEFAULT_REGION`
* `AWS_SECRET_ACCESS_KEY`
* `BRANCH_PRODUCTION`
* `BRANCH_STAGING`
* `S3_PRODUCTION`
* `S3_STAGING`

## Pulling / Pushing

*When pushing or pulling from this repository, use the standard methods.* However, when making updates to styles that you want to propagate to other TextUp repos, some specialized commands are needed.

To update your copy of the core styles:

* `git subtree pull  --prefix=app/styles/core --squash styles master`

To backport any changes to the core styles repository:

* `git subtree push  --prefix=app/styles/core --squash styles master`

Note the main drawback of this command is that all commits that touched the subtree and used. If we need more control, we can cherry pick the commits we want to push to the subtree. [More details about this and about all git-subtree related commands can be found at this tutorial](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec#.s0lfst7jk)

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment=production` (production)

### Deploying

#### Deploying to staging

* Push to the `dev` branch to trigger a Travis CI build OR
* Run `./deploy.sh dist demo.textup.org`

#### Deploying to production

* Push to the `master` branch to trigger a Travis CI build OR
* Run `./deploy.sh dist app.textup.org`

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## License

Copyright 2018 TextUp

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
