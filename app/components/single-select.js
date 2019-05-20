import { isPresent, tryInvoke } from '@ember/utils';
import { isArray } from '@ember/array';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  inputComponent: 'single-select/input',
  selected: null,
  onInsert: null,

  // Computed properties
  // -------------------

  selectedArray: computed('selected', function() {
    const selected = this.get('selected');
    return isArray(selected) ? selected : isPresent(selected) ? [selected] : [];
  }),

  // Actions
  // -------

  actions: {
    select(index, number, event) {
      return tryInvoke(this, 'onInsert', [number, event]);
    },
  },
});
