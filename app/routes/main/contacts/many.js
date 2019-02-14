import Ember from 'ember';
import ManagesContactAttributes from 'textup-frontend/mixins/route/manages-contact-attributes';
import ManagesTagMembership from 'textup-frontend/mixins/route/manages-tag-membership';

export default Ember.Route.extend(ManagesContactAttributes, ManagesTagMembership, {
  templateName: 'main/contacts/many',
  controllerName: 'main/contacts/many',
  backRouteName: 'main.contacts',

  setupController(controller) {
    this._super(...arguments);
    controller.set('backRouteName', this.get('backRouteName'));
  },

  actions: {
    willTransition() {
      this._super(...arguments);
      this.controller._deselectAll();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('selected').length === 0) {
        this.transitionTo(this.get('backRouteName'));
      }
      return true; // for closing slideouts
    },
  },
});
