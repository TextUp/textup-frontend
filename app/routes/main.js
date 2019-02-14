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

const { isNone, computed } = Ember;

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
    slideoutOutlet: computed.alias('constants.SLIDEOUT.OUTLET.DETAIL'),
    staffService: Ember.inject.service(),

    // Events
    // ------

    beforeModel: function(transition) {
      this._super(...arguments);
      const user = this.get('authService.authUser');
      return user.get('isNone').then(isNone => {
        const orgIsApproved = user.get('org.content.isApproved');
        if (isNone && orgIsApproved && user.get('isAdmin')) {
          if (transition.targetName !== 'main.index') {
            this.notifications.info(`You have no active TextUp accounts.
            You have been redirected to the admin page.`);
          }
          this.transitionTo('admin');
        } else if (isNone || !orgIsApproved) {
          if (transition.targetName !== 'main.index') {
            this.notifications.info(`You have no active TextUp accounts
            and are not an administrator. You have been redirected
            to the settings page.`);
          }
          this.transitionTo('none');
        }
        // unload contacts that might duplicate between different phones because of sharing
        // NOTE: this line must be BEFORE the model hook to avoid invalidating contacts
        // found in nested child routes
        this.store.unloadAll('contact');
      });
    },
    serialize: function(model) {
      return {
        main_identifier: model.get('urlIdentifier'),
      };
    },
    model: function(params) {
      const id = params.main_identifier,
        user = this.get('authService.authUser');
      // see if the identifier is the user
      if (id === user.get('urlIdentifier')) {
        return user;
      } else {
        // check to see if identifier is a team
        return user.get('teamsWithPhones').then(teams => {
          const team = teams.findBy('urlIdentifier', id);
          // if identifier is indeed a team
          if (team) {
            return team;
          } else {
            // do not display an error message here because, when we store the previously-visited
            // URL, this place will display an error even when we are trying to log into
            // a different user's account OR we are using a computer previously logged into
            // another user's TextUp account
            if (user.get('isAdmin')) {
              this.transitionTo('admin');
            } else {
              this.get('authService').logout();
            }
          }
        });
      }
    },
    afterModel: function(model) {
      const user = this.get('authService.authUser');
      // sometimes, strange race condition where the model isn't actually set yet
      // and the model parameter to this hook is actually hook. In those rare
      // occassions, transition to admin if available or prompt user to log in again
      if (isNone(model)) {
        if (user && user.get('isAdmin')) {
          this.transitionTo('admin');
        } else {
          this.notifications.error(`Sorry. We didn't get that. Your credentials should be
          correct. Please try to log in one more time.`);
          this.get('authService').logout();
        }
      }
      // double check that model has phone
      return model.get('phone').then(phone => {
        if (phone) {
          this.get('stateManager').set('owner', model);
        } else {
          // if doesn't have personal phone then transition to first team that has a TextUp phone
          // and check to see if this team has personal phone
          user.get('phone').then(phone => {
            if (!phone) {
              // transition to first team that has phone
              user.get('teamsWithPhones').then(teams => {
                if (teams[0]) {
                  this.transitionTo('main', teams[0]);
                } else {
                  this.notifications.error('No available active TextUp accounts found.');
                  if (user.get('isAdmin')) {
                    this.transitionTo('admin');
                  } else {
                    this.get('authService').logout();
                  }
                }
              });
            }
          });
        }
      });
    },
    setupController: function(controller, model) {
      this._super(...arguments);
      // load list of staff members available to share with
      this.get('staffService').loadStaffForSharing(model);
    },
    redirect: function(model, transition) {
      this._super(...arguments);
      if (transition.targetName === 'main.index') {
        this.transitionTo('main.contacts');
      }
    },

    // Actions
    // -------

    actions: {
      toggleSelected: function(contact) {
        if (!this.get('stateManager.viewingMany')) {
          if (this.get('stateManager.viewingTag')) {
            this.transitionTo('main.tag.many');
          } else if (this.get('stateManager.viewingSearch')) {
            this.transitionTo('main.search.many');
          } else {
            this.transitionTo('main.contacts.many');
          }
        }
        contact.toggleProperty('isSelected');
      },
      didTransition: function() {
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
