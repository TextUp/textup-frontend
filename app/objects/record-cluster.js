import { alias } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';

export const RecordCluster = EmberObject.extend({
  label: '',
  alwaysCluster: false,
  numItems: alias('items.length'),
  items: computed(() => [])
});
