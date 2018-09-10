import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from 'textup-frontend/utils/uniq-by';
import { pluralize } from 'textup-frontend/utils/text';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

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

  // polymorphic needs `inverse: '_recordItems'` in `mixins/model/owns-record-items`
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
    clustersList.forEach(addClusterLabel);
    clustersList.forEach(alwaysClusterDeletedItems);
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

function addClusterLabel(cluster) {
  const numItems = cluster.get('numItems');
  if (numItems > 0) {
    const rItem = cluster.get('items.firstObject'),
      measureWord = pluralize('item', numItems),
      labelWords = rItem.get('hasBeenDeleted')
        ? [numItems, 'deleted', measureWord]
        : [numItems, measureWord];
    cluster.set('label', labelWords.join(' '));
  }
}

function alwaysClusterDeletedItems(cluster) {
  if (cluster.get('items.firstObject.hasBeenDeleted')) {
    cluster.set('alwaysCluster', true);
  }
}
