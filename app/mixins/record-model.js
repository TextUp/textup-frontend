import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from '../utils/uniq-by';

const { isPresent, isNone, computed, get, computed: { sort } } = Ember;

export default Ember.Mixin.create({
  // Attributes
  // ----------

  lastRecordActivity: DS.attr('date'),
  language: DS.attr('string'),
  // (1) what we get from the backend
  unsortedRecords: DS.hasMany('record'),
  // (2) make sure the records are unique
  uniqueRecords: uniqBy('unsortedRecords', 'id'),
  // (3) sort the records 'asc' meaning from oldest (small # millis) to newest (big # millis)
  recordsSorting: ['whenCreated:asc'],
  sortedRecords: sort('uniqueRecords', 'recordsSorting'),
  // (4) group deleted elements. Note that `@each` property also implies `.[]` too.
  // We choose to watch the `hasBeenDeleted` property because we need to update
  // groupings only when a note is deleted or un-deleted. We don't modify this
  // property directly in this app. Instead we use the `toggleNoteDeleteStatus`
  // attribute and wait for the backend return after persisting
  // and deletes or un-deletes.
  records: computed('sortedRecords.@each.hasBeenDeleted', function() {
    if (this.get('isDeleted')) {
      return [];
    }
    if (isNone(this.get('_groupedRecords'))) {
      this.set('_groupedRecords', []);
    }
    const grouped = this.get('_groupedRecords');
    let lastItemIsAlreadyDeleted = false,
      numItemsInGroup = 0,
      numGroups = 0;
    // clear grouped in preparation for redoing groupings
    grouped.clear();
    // iterate through records and group as necessary
    this.get('sortedRecords').forEach(record => {
      if (!record.get('isDirty') && record.get('hasBeenDeleted') === true) {
        if (lastItemIsAlreadyDeleted) {
          // add deleted item to cluster
          const deletedCluster = grouped.get('lastObject');
          if (get(deletedCluster, 'isDeletedCluster')) {
            get(deletedCluster, 'items').pushObject(record);
            numItemsInGroup += 1;
          } else {
            lastItemIsAlreadyDeleted = false;
            grouped.pushObject(record);
          }
        } else {
          lastItemIsAlreadyDeleted = true;
          grouped.pushObject(this._buildDeletedCluster(record));
          numGroups += 1;
          numItemsInGroup += 1;
        }
      } else {
        lastItemIsAlreadyDeleted = false;
        grouped.pushObject(record);
      }
    });
    this.setProperties({
      _numItemsInGroup: numItemsInGroup,
      _numGroups: numGroups
    });
    return grouped;
  }),
  recordsAdjustedSize: computed('records.[]', '_numItemsInGroup', '_numGroups', function() {
    const len = this.get('records.length'),
      numI = this.get('_numItemsInGroup'),
      numG = this.get('_numGroups');
    return isPresent(len) && isPresent(numI) && isPresent(numG) ? len + numI - numG : 0;
  }),

  // Not attributes
  // --------------

  totalNumRecords: '--',

  // Private attributes
  // ------------------

  // cache the grouped array so when we re-group, we don't force components
  // to re-render thinking that this is a completedly new array
  _groupedRecords: null,
  // below two properties used for calculating adjusted size
  _numItemsInGroup: 0,
  _numGroups: 0,

  // Helper methods
  // --------------

  _buildDeletedCluster: function(item = null) {
    return {
      isDeletedCluster: true,
      items: isPresent(item) ? [item] : []
    };
  }
});
