import Ember from 'ember';

const { computed, set, get } = Ember;

export default Ember.Service.extend({
  // Properties
  // ----------

  shouldShow: computed.readOnly('_outletNameToCurrentSlideoutName'),

  // Internal properties
  // -------------------

  _outletNameToTemplateName: Object.create(null),
  _outletNameToCurrentSlideoutName: Object.create(null),

  // Methods
  // -------

  registerOutlet(templateName, outletName) {
    set(this.get('_outletNameToTemplateName'), outletName, templateName);
  },
  getTemplateNameFromOutlet(outletName) {
    return get(this.get('_outletNameToTemplateName'), outletName);
  },

  isAlreadyShowing(outletName, slideoutName) {
    return get(this.get('_outletNameToCurrentSlideoutName'), outletName) === slideoutName;
  },
  showForOutlet(outletName, slideoutName) {
    set(this.get('_outletNameToCurrentSlideoutName'), outletName, slideoutName);
  },
  hideForOutlet(outletName) {
    set(this.get('_outletNameToCurrentSlideoutName'), outletName, null);
  },
  hideForAll() {
    const currentSlideout = this.get('_outletNameToCurrentSlideoutName');
    Object.keys(currentSlideout).forEach(outletName => {
      set(currentSlideout, outletName, null);
    });
  }
});
