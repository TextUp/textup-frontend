import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default EmberObject.extend({
  label: '',
  alwaysCluster: false,
  numItems: alias('items.length'),
  items: computed(() => []),
});
