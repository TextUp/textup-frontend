import Ember from 'ember';

const { computed } = Ember;

export const ContactObject = Ember.Object.extend({
  name: '',
  numbers: computed(() => []),
  count: computed.alias('numbers.length'),
});
