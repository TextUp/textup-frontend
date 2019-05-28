import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export const DEFAULT_ACTIVE_CLASS = 'active';

export default Helper.extend({
  staffListService: service(),
  stateService: service(),

  compute([filter], { ifTrue = DEFAULT_ACTIVE_CLASS, ifFalse = '' }) {
    return !this.get('stateService.viewingTeam') && this.get('staffListService.filter') === filter
      ? ifTrue
      : ifFalse;
  },
});
