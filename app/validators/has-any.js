import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';

const { get, typeOf } = Ember;

const HasAny = BaseValidator.extend({
  validate(value, options, model /*, attribute*/) {
    let hasAny = value;
    ensureArrayOfStrings(options).forEach(attr => (hasAny = hasAny || get(model, attr)));
    return !!hasAny || this.createErrorMessage('hasAny', value, options);
  }
});

HasAny.reopenClass({
  /**
   * Define attribute specific dependent keys for your validator
   *
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor(attribute, options) {
    const keys = buildKeysFor(attribute);
    ensureArrayOfStrings(options).forEach(attr => keys.pushObjects(buildKeysFor(attr)));
    return keys;
  }
});

function ensureArrayOfStrings(options) {
  let attrsToCheck = get(options, 'also');
  return typeOf(attrsToCheck) === 'array'
    ? attrsToCheck.filter(attr => typeOf(attr) === 'string')
    : [];
}

function buildKeysFor(keyName) {
  // need to include `_model` keys because those are the ones that seem to cause the computed
  // property to re-execute from empirical investigation.
  return [`model.${keyName}`, `model.${keyName}.[]`, `_model.${keyName}`, `_model.${keyName}.[]`];
}

export default HasAny;
