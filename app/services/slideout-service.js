import { readOnly } from '@ember/object/computed';
import Service from '@ember/service';
import { get, set } from '@ember/object';

export default Service.extend({
  // Properties
  // ----------

  shouldShow: readOnly('_outletNameToCurrentSlideoutName'),

  // Internal properties
  // -------------------

  _outletNameToTemplateName: {},
  _outletNameToCurrentSlideoutName: {},

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
  },
});
