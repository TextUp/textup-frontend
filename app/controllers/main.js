import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  stateService: service(),

  filter: alias('stateService.owner.phone.content.contactsFilter'),
  accountSwitcher: null,
  slidingMenu: null,
});
