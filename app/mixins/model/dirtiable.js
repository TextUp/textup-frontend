import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  isDirty: computed('hasDirtyAttributes', 'hasManualChanges', function() {
    return !!this.get('hasDirtyAttributes') || !!this.get('hasManualChanges');
  })
});
