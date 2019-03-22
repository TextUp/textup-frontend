import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasAuthor from 'textup-frontend/mixins/model/has-author';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import TypeUtils from 'textup-frontend/utils/type';

const { computed, get, getWithDefault, typeOf, tryInvoke } = Ember;

export default DS.Model.extend(Dirtiable, HasAuthor, {
  // Overrides
  // ---------

  rollbackAttributes() {
    this.get('_recipients').clear();
    this.get('_newNumberRecipients').clear();
    tryInvoke(getWithDefault(this, 'media.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  didUpdate() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  hasManualChanges: computed.alias('media.isDirty'),

  // Properties
  // ----------

  whenCreated: DS.attr('date'),
  outgoing: DS.attr('boolean'),
  hasAwayMessage: DS.attr('boolean'),
  hasBeenDeleted: DS.attr('boolean'),
  noteContents: DS.attr('string', { defaultValue: '' }),

  receipts: DS.attr('record-item-status'), // now a json object with no id
  media: DS.belongsTo('media'), // hasOne

  // belong to either a contact or a tag
  contact: DS.belongsTo('contact', { inverse: '_recordItems' }), // see owns-record-items model mixin
  tag: DS.belongsTo('tag', { inverse: '_recordItems' }), // see owns-record-items model mixin

  recipients: computed.readOnly('_recipients'),
  newNumberRecipients: computed.readOnly('_newNumberRecipients'),
  numRecipients: computed('_recipients.[]', '_newNumberRecipients.[]', function() {
    return (
      getWithDefault(this, '_recipients.length', 0) +
      getWithDefault(this, '_newNumberRecipients.length', 0)
    );
  }),

  // Private properties
  // ------------------

  _recipients: computed(() => []),
  _newNumberRecipients: computed(() => []),

  // Methods
  // -------

  addRecipient(obj) {
    return addRecipientFor(obj, getListFor(this, obj));
  },
  removeRecipient(obj) {
    return removeRecipientFor(obj, getListFor(this, obj));
  },
});

function getListFor(ctx, obj) {
  return typeOf(obj) === 'string' ? ctx.get('_newNumberRecipients') : ctx.get('_recipients');
}

function addRecipientFor(obj, list) {
  if (!list) {
    return false;
  }
  return typeOf(obj) === 'string'
    ? _addRecipientForNumber(obj, list)
    : _addRecipientForObject(obj, list);
}
function _addRecipientForNumber(num, list) {
  if (PhoneNumberUtils.validate(num)) {
    const cleanedNum = PhoneNumberUtils.clean(num);
    if (!list.find(existingNum => existingNum === cleanedNum)) {
      list.pushObject(cleanedNum);
    }
    return true;
  }
  return false;
}
function _addRecipientForObject(obj, list) {
  if (!get(obj, 'id') || !list.find(existingObj => get(existingObj, 'id') === get(obj, 'id'))) {
    list.pushObject(obj);
  }
  return true;
}

function removeRecipientFor(obj, list) {
  if (!list) {
    return false;
  }
  return typeOf(obj) === 'string'
    ? _removeRecipientForNumber(obj, list)
    : _removeRecipientForObject(obj, list);
}
function _removeRecipientForNumber(num, list) {
  if (PhoneNumberUtils.validate(num)) {
    const cleanedNum = PhoneNumberUtils.clean(num),
      foundNum = list.find(existingNum => existingNum === cleanedNum);
    if (foundNum) {
      list.removeObject(cleanedNum);
      return true;
    }
  }
  return false;
}
function _removeRecipientForObject(obj, list) {
  const foundObj = list.find(existingObj => get(existingObj, 'id') === get(obj, 'id'));
  if (foundObj) {
    list.removeObject(obj);
    return true;
  }
  return false;
}
