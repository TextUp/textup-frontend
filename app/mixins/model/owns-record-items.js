import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from '../../utils/uniq-by';

const { computed, typeOf } = Ember;

export const RecordCluster = Ember.Object.extend({
  label: '',
  numItems: computed.alias('items.length'),
  items: computed(() => [])
});

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

  _recordItems: DS.hasMany('record-item', { polymorphic: true }),
  _uniqueRecordItems: uniqBy('_recordItems.content', 'id'),
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
