import { alias } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';

export const ContactObject = EmberObject.extend({
  name: '',
  numbers: computed(() => []),
  count: alias('numbers.length'),
});
