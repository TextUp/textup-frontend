import Constants from 'textup-frontend/constants';
import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default Mixin.create({
  slideoutService: service(),

  slideoutOutlet: Constants.SLIDEOUT.OUTLET.DEFAULT,

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, this._registerOutlet);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      this._clearAndReregisterOutlet();
      return true; // for bubbling
    },
    // TODO remove
    toggleSlideout() {},
    // TODO remove
    closeSlideout() {},
  },

  // Internal methods
  // ----------------

  _clearAndReregisterOutlet() {
    this.get('slideoutService').closeSlideout();
    // need to re-register outlet because we need to update the template name to outlet name
    // mapping in the case that we have multiple outlets of the same name
    this._registerOutlet();
  },
  _registerOutlet() {
    this.get('slideoutService').registerOutlet(
      this.get('slideoutOutlet'),
      this.get('templateName') || this.get('routeName'),
      this.get('controllerName') || this.get('routeName')
    );
  },
});
