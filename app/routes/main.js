import AppAccessUtils from 'textup-frontend/utils/app-access';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import ManagesNewContacts from 'textup-frontend/mixins/route/manages-new-contacts';
import ManagesNewTags from 'textup-frontend/mixins/route/manages-new-tags';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';
import SupportsAvailabilitySlideout from 'textup-frontend/mixins/route/supports-availability-slideout';
import SupportsCallSlideout from 'textup-frontend/mixins/route/supports-call-slideout';
import SupportsComposeSlideout from 'textup-frontend/mixins/route/supports-compose-slideout';
import SupportsExportSlideout from 'textup-frontend/mixins/route/supports-export-slideout';
import SupportsFeedbackSlideout from 'textup-frontend/mixins/route/supports-feedback-slideout';

export default Ember.Route.extend(
  HasSlideoutOutlet,
  IsAuthenticated,
  ManagesNewContacts,
  ManagesNewTags,
  RequiresSetup,
  SupportsAvailabilitySlideout,
  SupportsCallSlideout,
  SupportsComposeSlideout,
  SupportsExportSlideout,
  SupportsFeedbackSlideout,
  {
    authService: Ember.inject.service(),
    notifications: Ember.inject.service('notification-messages-service'),
    sharingService: Ember.inject.service(),
    stateService: Ember.inject.service(),

    slideoutOutlet: Constants.SLIDEOUT.OUTLET.DETAIL,

    // Events
    // ------

    beforeModel() {
      this._super(...arguments);
      // unload contacts that might duplicate between different phones because of sharing
      // [NOTE] this line must be BEFORE the model hook to avoid invalidating contacts
      // found in nested child routes
      this.store.unloadAll('contact');
    },
    serialize(model) {
      return { main_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
    },
    // `model` hook will not be called if the model object is already provided
    model(params) {
      this._super(...arguments);
      const authUser = this.get('authService.authUser'),
        foundModel = AppAccessUtils.tryFindPhoneOwnerOrSelfFromUrl(
          authUser,
          params.main_identifier
        );
      if (foundModel) {
        return foundModel;
      } else {
        this.get('notifications').info('Please log in to access this TextUp phone.');
        this.get('authService').logout();
      }
    },
    afterModel(model = null) {
      this._super(...arguments);
      if (AppAccessUtils.isActivePhoneOwner(model)) {
        this.get('stateService').set('owner', model);
      } else {
        AppAccessUtils.determineAppropriateLocation(this, this.get('authService.authUser'));
      }
    },
    setupController(controller, model) {
      this._super(...arguments);
      this.get('sharingService').loadStaffCandidatesForPhoneOwner(model);
    },
    redirect(model, transition) {
      this._super(...arguments);
      if (transition.targetName === 'main.index') {
        this.transitionTo('main.contacts');
      }
    },

    // Actions
    // -------

    actions: {
      toggleSelected(contact) {
        if (!this.get('stateService.viewingMany')) {
          if (this.get('stateService.viewingTag')) {
            this.transitionTo('main.tag.many');
          } else if (this.get('stateService.viewingSearch')) {
            this.transitionTo('main.search.many');
          } else {
            this.transitionTo('main.contacts.many');
          }
        }
        contact.toggleProperty('isSelected');
      },
      didTransition() {
        this._super(...arguments);
        // close account slideout and drawer after transition
        const accountSwitcher = this.controller.get('accountSwitcher'),
          slidingMenu = this.controller.get('slidingMenu');
        if (accountSwitcher) {
          accountSwitcher.actions.close();
        }
        if (slidingMenu) {
          slidingMenu.actions.close();
        }
        return true;
      },
    },
  }
);
