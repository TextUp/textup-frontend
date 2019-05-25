import Service from '@ember/service';
import { computed, get, set } from '@ember/object';
import { getOwner } from '@ember/application';
import { readOnly } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

export default Service.extend({
  // Properties
  // ----------

  shouldShow: readOnly('_outletToCurrentSlideoutName'),

  // Methods
  // -------

  registerOutlet(outlet, templateName, controllerName) {
    set(this.get('_outletToTemplateName'), outlet, templateName);
    set(this.get('_outletToControllerName'), outlet, controllerName);
  },

  // TODO Is passing in controller even needed???
  toggleSlideout(slideoutName, outlet, controller = null) {
    if (this._isAlreadyShowing(outlet, slideoutName)) {
      this.closeSlideout(outlet);
    } else {
      this._openSlideout(slideoutName, outlet, controller);
    }
  },
  closeSlideout(outlet = null) {
    if (outlet) {
      this._hideForOutlet(outlet);
    } else {
      this._hideForAll();
    }
  },

  // Internal
  // --------

  _outletToTemplateName: computed(function() {
    return {};
  }),
  _outletToControllerName: computed(function() {
    return {};
  }),
  _outletToCurrentSlideoutName: computed(function() {
    return {};
  }),
  _applicationRoute: computed(function() {
    return getOwner(this).lookup('route:application'); // guaranteed to be visited in app
  }),

  _openSlideout(slideoutName, outlet, controller = null) {
    this.get('_applicationRoute').render(slideoutName, {
      into: get(this.get('_outletToTemplateName'), outlet),
      controller: controller || get(this.get('_outletToControllerName'), outlet),
      outlet,
    });
    scheduleOnce('afterRender', () => this._showForOutlet(outlet, slideoutName));
  },

  _isAlreadyShowing(outlet, slideoutName) {
    return get(this.get('_outletToCurrentSlideoutName'), outlet) === slideoutName;
  },
  _showForOutlet(outlet, slideoutName) {
    set(this.get('_outletToCurrentSlideoutName'), outlet, slideoutName);
  },
  _hideForOutlet(outlet) {
    set(this.get('_outletToCurrentSlideoutName'), outlet, null);
  },
  _hideForAll() {
    const outletToSlideout = this.get('_outletToCurrentSlideoutName');
    Object.keys(outletToSlideout).forEach(outlet => set(outletToSlideout, outlet, null));
  },
});
