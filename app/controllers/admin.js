import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  pending: null,
  numPending: null,

  accountSwitcher: null,
});
