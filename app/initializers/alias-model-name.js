import { computed } from '@ember/object';
import DS from 'ember-data';
import Constants from 'textup-frontend/constants';

// TODO test
// [NOTE] if this is removed, also need to update `modelModel`in `tests/helpers/utilities`
// See https://github.com/emberjs/ember.js/issues/14014#issuecomment-279445221

export function aliasModelName() {
  DS.Model.reopen({
    [Constants.PROP_NAME.MODEL_NAME]: computed(function() {
      return this.get('constructor.modelName');
    }),
  });
}

// Because of a bug involving the read-only attribute `constructor` on models during initialization
// we need to alias `constructor.modelName` and we need tests to be aware of this aliasing
// in order to pass. This method cleans up any aliasing that we do within tests
export function cleanUpModelNameAlias() {
  DS.Model.reopen({ [Constants.PROP_NAME.MODEL_NAME]: null });
}

export default {
  name: 'alias-model-name',
  initialize: aliasModelName,
};
