import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  stateService: Ember.inject.service(),

  // displaying active menu items
  filter: computed.alias('stateService.owner.phone.content.contactsFilter'),
});
