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
    // sometimes, we still need to specify dependent key on the model because all strings
    // NOT prefaced with `model.` are assigned automatically prefaced to the validations namespace
    // Sometimes we just want the computed key to be `media.hasElements` not `model.media.hasElements`
    // or `model.validations.attrs.media.hasElements` but in this hook we have no way of
    // specifying just `media.hasElements`.
    // See https://rawgit.com/offirgolan/ember-cp-validations/c4123c983e54f24dd790ffa1bad66cfdf2f47ec6/docs/classes/Custom.html
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
  return [`model.${keyName}`, `model.${keyName}.[]`];
}

export default HasAny;
