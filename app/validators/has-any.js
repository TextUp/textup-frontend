import ArrayUtils from 'textup-frontend/utils/array';
import BaseValidator from 'ember-cp-validations/validators/base';
import Ember from 'ember';

const { get, typeOf } = Ember;

const HasAny = BaseValidator.extend({
  validate(value, options, model) {
    let hasAny = value;
    ensureArrayOfStrings(options).forEach(attr => (hasAny = hasAny || get(model, attr)));
    return !!hasAny || this.createErrorMessage('hasAny', value, options);
  },
});

HasAny.reopenClass({
  getDependentsFor(attribute, options) {
    const keys = buildKeysFor(attribute);
    ensureArrayOfStrings(options).forEach(attr => keys.pushObjects(buildKeysFor(attr)));
    return keys;
  },
});

function ensureArrayOfStrings(options) {
  return ArrayUtils.ensureArrayAndAllDefined(get(options, 'also')).filter(
    attr => typeOf(attr) === 'string'
  );
}

function buildKeysFor(keyName) {
  // need to include `_model` keys because those are the ones that seem to cause the computed
  // property to re-execute from empirical investigation.
  return [`model.${keyName}`, `model.${keyName}.[]`];
}

export default HasAny;
