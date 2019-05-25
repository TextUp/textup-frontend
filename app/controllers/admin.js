import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  filter: Constants.STAFF.FILTER.ACTIVE,
  pending: computed(() => []),
  numPending: null,
  people: computed(() => []),
});
