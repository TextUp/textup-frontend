import DS from 'ember-data';
import Mixin from '@ember/object/mixin';
import RecordCluster from 'textup-frontend/objects/record-cluster';
import RecordItemModel from 'textup-frontend/models/record-item';
import { alias, readOnly, uniqBy, sort } from '@ember/object/computed';
import { computed } from '@ember/object';
import { pluralize } from 'textup-frontend/utils/text';
import { typeOf } from '@ember/utils';

export default Mixin.create({
  // Properties
  // ----------

  lastRecordActivity: DS.attr('date'),
  language: DS.attr('string'),

  totalNumRecordItems: null,
  numRecordItems: alias('_sortedRecordItems.length'),
  recordItems: readOnly('_sortedRecordItems'),
  numRecordClusters: alias('_recordClusters.length'),
  recordClusters: readOnly('_recordClusters'),

  // Private properties
  // ------------------

  // polymorphic needs `inverse: '_recordItems'` in `models/record-item`
  _recordItems: DS.hasMany('record-item', { polymorphic: true }),
  _uniqueRecordItems: uniqBy('_recordItems', 'id'),
  _recordsSorting: ['whenCreated:asc'],
  _sortedRecordItems: sort('_uniqueRecordItems', '_recordsSorting'),

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
    if (item instanceof RecordItemModel) {
      this.get('_recordItems').pushObject(item);
      return true;
    } else {
      return false;
    }
  },
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
