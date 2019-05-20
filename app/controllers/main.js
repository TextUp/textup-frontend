import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  stateService: service(),

  // displaying active menu items
  filter: alias('stateService.owner.phone.content.contactsFilter'),
});
