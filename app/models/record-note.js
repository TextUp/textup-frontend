import { notEmpty, sort, readOnly } from '@ember/object/computed';
import { getWithDefault, get, computed } from '@ember/object';
import { tryInvoke, typeOf } from '@ember/utils';
import DS from 'ember-data';
import RecordItem from './record-item';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  numRecipients: validator('inclusion', {
    disabled: computed('model.isNew', function() {
      return !this.get('model.isNew');
    }),
    dependentKeys: ['model.isNew'],
    in: [1],
    message: 'should have exactly one recipient',
  }),
  'recipients.length': validator('has-any', {
    disabled: computed('model.isNew', function() {
      return !this.get('model.isNew');
    }),
    also: ['newNumberRecipients.length'],
    dependentKeys: ['model.isNew', 'model.numRecipients'],
    description: 'a contact, a shared contact, or a tag',
  }),
  noteContents: validator('has-any', {
    also: ['media.hasElements', 'location.content'],
    description: 'contents, images, or a location',
  }),
});

export default RecordItem.extend(Validations, {
  // Overrides
  // ---------

  rollbackAttributes() {
    this.set('_addAfterDate', null);
    tryInvoke(getWithDefault(this, 'location.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  hasManualChanges: computed('media.isDirty', 'location.isDirty', function() {
    return this.get('media.isDirty') || this.get('location.isDirty');
  }),

  // Properties
  // ----------

  whenChanged: DS.attr('date'),
  isReadOnly: DS.attr('boolean'),

  location: DS.belongsTo('location'), // hasOne

  hasRevisions: notEmpty('_revisions'),
  revisions: sort('_revisions', '_revisionsSorting'),

  addAfterDate: readOnly('_addAfterDate'),

  // Private properties
  // ------------------

  _revisions: DS.hasMany('record-note-revision'),
  _revisionsSorting: ['whenChanged:desc'],
  _addAfterDate: null,

  // Methods
  // -------

  addAfter(rItem) {
    if (typeOf(rItem) !== 'object' && typeOf(rItem) !== 'instance') {
      return false;
    }
    this.set('_addAfterDate', get(rItem, 'whenCreated'));
    return true;
  },
});
