import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  backRouteName: computed('model.isDeleted', function() {
    return this.get('model.isDeleted') ? 'main.contacts' : 'main.tag';
  })
});
