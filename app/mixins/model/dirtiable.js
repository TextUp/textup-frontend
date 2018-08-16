import Ember from 'ember';

export default Ember.Mixin.create({
  isDirty: Ember.computed('hasDirtyAttributes', 'hasManualChanges', function() {
    return !!this.get('hasDirtyAttributes') || !!this.get('hasManualChanges');
  })
});
