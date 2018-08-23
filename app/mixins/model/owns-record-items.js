import DS from 'ember-data';
import Ember from 'ember';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';
import uniqBy from 'textup-frontend/utils/uniq-by';

const { computed, typeOf } = Ember;

export default Ember.Mixin.create({
  // Properties
  // ----------

  lastRecordActivity: DS.attr('date'),
  language: DS.attr('string'),

  totalNumRecordItems: null,
  numRecordItems: computed.alias('_sortedRecordItems.length'),
  recordItems: computed.readOnly('_sortedRecordItems'),
  numRecordClusters: computed.alias('_recordClusters.length'),
  recordClusters: computed.readOnly('_recordClusters'),

  // Private properties
  // ------------------

  // originally, `_recordItems` was set to
  //    _recordItems: DS.hasMany('record-item', { polymorphic: true }),
  //    _uniqueRecordItems: uniqBy('_recordItems.content', 'id'),
  // However, there's some weirdness around this version of Ember data making polymorphic
  // records available under both the base class and the subclass. We had issues where calling
  // `v1/records` would return a polymorphic payload, but these models would only be available
  // under their respective subclasses. Therefore, we manually add merge these subclasses
  // here instead of relying on a declared polymorphic relationship property
  _recordItems: DS.hasMany('record-item'),
  _recordTexts: DS.hasMany('record-text'),
  _recordCalls: DS.hasMany('record-call'),
  _recordNotes: DS.hasMany('record-note'),
  _mergedRecordItems: computed(
    '_recordItems.[]',
    '_recordTexts.[]',
    '_recordCalls.[]',
    '_recordNotes.[]',
    function() {
      const results = [];
      this.get('_recordItems.content').forEach(obj => results.pushObject(obj));
      this.get('_recordTexts.content').forEach(obj => results.pushObject(obj));
      this.get('_recordCalls.content').forEach(obj => results.pushObject(obj));
      this.get('_recordNotes.content').forEach(obj => results.pushObject(obj));
      return results;
    }
  ),
  _uniqueRecordItems: uniqBy('_mergedRecordItems', 'id'),
  _recordsSorting: ['whenCreated:asc'],
  _sortedRecordItems: computed.sort('_uniqueRecordItems', '_recordsSorting'),

  _recordClustersList: computed(() => []),
  _recordClusters: computed('_sortedRecordItems.@each.hasBeenDeleted', function() {
    const rItems = this.get('_sortedRecordItems'),
      clustersList = this.get('_recordClustersList');
    clustersList.clear();
    let currentCluster = RecordCluster.create(),
      prevIsDeleted = false;
    rItems.forEach(rItem => {
      const hasBeenDeleted = !!rItem.get('hasBeenDeleted');
      if (!prevIsDeleted || prevIsDeleted !== hasBeenDeleted) {
        if (currentCluster.get('numItems') > 0) {
          clustersList.pushObject(currentCluster);
        }
        currentCluster = RecordCluster.create();
      }
      prevIsDeleted = hasBeenDeleted;
      currentCluster.get('items').pushObject(rItem);
    });
    if (currentCluster.get('numItems') > 0) {
      clustersList.pushObject(currentCluster);
    }
    return clustersList;
  }),

  // Methods
  // -------

  addRecordItems(items) {
    if (typeOf(items) !== 'array') {
      return false;
    }
    let isAllSuccess = true;
    items.forEach(item => (isAllSuccess = isAllSuccess && this.addRecordItem(item)));
    return isAllSuccess;
  },

  addRecordItem(item) {
    if (!item) {
      return false;
    }
    this.get('_recordItems').pushObject(item);
    return true;
  }
});
