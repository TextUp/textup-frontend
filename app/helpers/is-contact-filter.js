import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export const DEFAULT_ACTIVE_CLASS = 'active';

export default Helper.extend({
  contactListService: service(),
  stateService: service(),

  compute([filter], { ifTrue = DEFAULT_ACTIVE_CLASS, ifFalse = '' }) {
    return this.get('stateService.viewingContacts') &&
      this.get('contactListService.filter') === filter
      ? ifTrue
      : ifFalse;
  },
});
