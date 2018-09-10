import Ember from 'ember';

const { computed, run } = Ember;

export default Ember.Mixin.create({
  slideoutService: Ember.inject.service(),
  slideoutOutlet: computed.alias('constants.SLIDEOUT.OUTLET.DEFAULT'),

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => {
      this.get('slideoutService').registerOutlet(
        this.get('templateName') || this.get('routeName'),
        this.get('slideoutOutlet')
      );
    });
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('slideoutService', this.get('slideoutService'));
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      this._closeSlideout();
      return true;
    },
    toggleSlideout() {
      this._toggleSlideout(...arguments);
    },
    closeSlideout() {
      this._closeSlideout(...arguments);
    }
  },

  // Internal methods
  // ----------------

  _toggleSlideout(slideoutName, myController = null, myOutlet = null) {
    const outletName = myOutlet || this.get('slideoutOutlet'),
      controllerName = myController || this.get('controllerName') || this.get('routeName');
    if (this.get('slideoutService').isAlreadyShowing(outletName, slideoutName)) {
      this._closeSlideout(outletName);
    } else {
      this._openSlideout(slideoutName, controllerName, outletName);
    }
  },
  _openSlideout(slideoutName, controllerName, outletName) {
    const slideoutService = this.get('slideoutService');
    this.render(slideoutName, {
      into: slideoutService.getTemplateNameFromOutlet(outletName),
      controller: controllerName,
      outlet: outletName
    });
    run.scheduleOnce('afterRender', () => slideoutService.showForOutlet(outletName, slideoutName));
  },
  _closeSlideout(outletName = null) {
    const slideoutService = this.get('slideoutService');
    if (outletName) {
      slideoutService.hideForOutlet(outletName);
    } else {
      slideoutService.hideForAll();
    }
  }
});
