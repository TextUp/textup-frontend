import Ember from 'ember';
import ManagesContactAttributes from 'textup-frontend/mixins/route/manages-contact-attributes';
import ManagesTagMembership from 'textup-frontend/mixins/route/manages-tag-membership';

export default Ember.Route.extend(ManagesContactAttributes, ManagesTagMembership, {
  templateName: 'main/contacts/many',
  controllerName: 'main/contacts/many',
  backRouteName: 'main.contacts',

  actions: {
    willTransition() {
      this._super(...arguments);
      this.controller._deselectAll();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('selected').length === 0) {
        this.send('exitMany');
      }
      return true; // for closing slideouts
    },
    exitMany() {
      this.transitionTo(this.get('backRouteName'));
    },
  },
});
