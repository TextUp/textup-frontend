import Ember from 'ember';

const { computed } = Ember;

export const RecordCluster = Ember.Object.extend({
  label: '',
  alwaysCluster: false,
  numItems: computed.alias('items.length'),
  items: computed(() => [])
});
