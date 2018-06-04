import Auth from '../mixins/auth-route';
import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';
import Setup from '../mixins/setup-route';
import Slideout from '../mixins/slideout-route';
import { validate as validateNumber, clean as cleanNumber } from '../utils/phone-number';

const { isNone, isPresent, run: { debounce, next }, RSVP: { Promise } } = Ember;

export default Ember.Route.extend(Slideout, Auth, Setup, {
  slideoutOutlet: 'details-slideout',

  // Events
  // ------

  beforeModel: function(transition) {
    this._super(...arguments);
    const user = this.get('authManager.authUser');
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
    });
  },
  serialize: function(model) {
    return {
      main_identifier: model.get('urlIdentifier')
    };
  },
  model: function(params) {
    const id = params.main_identifier,
      user = this.get('authManager.authUser');
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
            this.get('authManager').logout();
          }
        }
      });
    }
  },
  afterModel: function(model) {
    const user = this.get('authManager.authUser');
    // sometimes, strange race condition where the model isn't actually set yet
    // and the model parameter to this hook is actually hook. In those rare
    // occassions, transition to admin if available or prompt user to log in again
    if (isNone(model)) {
      if (user && user.get('isAdmin')) {
        this.transitionTo('admin');
      } else {
        this.notifications.error(`Sorry. We didn't get that. Your credentials should be
          correct. Please try to log in one more time.`);
        this.get('authManager').logout();
      }
    }
    // double check that model has phone
    return model.get('phone').then(phone => {
      if (phone) {
        this.get('stateManager').set('owner', model);
      } else {
        // if doesn't have personal phone then transition to
        // first team that has a TextUp phone
        // check to see if has personal phone
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
                  this.get('authManager').logout();
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
    // unload contacts that might duplicate between different phones
    // because of sharing arrangements
    this.store.unloadAll('contact');
    // load list of staff members available to share with
    this._loadOtherStaff(model);
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
    willTransition: function() {
      this.controller.set('_transitioning', true);
      return true;
    },

    // Slideout
    // --------

    didTransition: function() {
      this._closeSlideout();
      // close account slideout and drawer after transition
      const accountSwitcher = this.controller.get('accountSwitcher'),
        slidingMenu = this.controller.get('slidingMenu');
      if (accountSwitcher) {
        accountSwitcher.actions.close();
      }
      if (slidingMenu) {
        slidingMenu.actions.close();
      }
      // see main.contacts controller for explanation
      this.controller.set('_transitioning', false);
      return true;
    },
    toggleDetailSlideout: function(name, context) {
      this._toggleSlideout(name, context);
    },
    openDetailSlideout: function(name, context) {
      this._openSlideout(name, context);
    },
    closeSlideout: function() {
      this._closeSlideout();
      return true;
    },
    closeAllSlideouts: function(then) {
      this.send('closeSlideout');
      callIfPresent(then);
    },

    // Contact
    // -------

    initializeNewContact: function() {
      this.controller.set(
        'newContact',
        this.store.createRecord('contact', {
          language: this.get('stateManager.owner.phone.content.language')
        })
      );
    },
    cleanNewContact: function() {
      // nullify newContact to avoid sortable numbers component setting
      // a copied version of the numbers array after the newContact is
      // rolled back (thus deleted) which triggers an error from ember data
      this.controller.set('newContact', null);
    },
    createContact: function(contact, then) {
      return this.get('dataHandler')
        .persist(contact)
        .then(() => {
          const contacts = this.controller.get('contacts');
          if (contacts) {
            contacts.unshiftObject(contact);
          }
          callIfPresent(then);
        });
    },
    removeFromContactNumberDuplicates: function(contact, removedNum) {
      contact.removeDuplicatesForNumber(removedNum);
    },
    checkContactNumberDuplicates: function(contact, addedNum) {
      this._searchContactsByNumber(addedNum).then(results => {
        contact.addDuplicatesForNumber(addedNum, results.toArray());
      });
    },
    closeSlideoutAndOpenDuplicate: function(closeAction, dupId) {
      closeAction();
      this.transitionTo('main.contacts.contact', dupId);
    },
    markUnread: function(data) {
      const contacts = Ember.isArray(data) ? data : [data];
      contacts.forEach(contact => contact.markUnread());
      this._changeContactStatus(contacts);
    },
    markActive: function(data) {
      const contacts = Ember.isArray(data) ? data : [data];
      contacts.forEach(contact => contact.markActive());
      this._changeContactStatus(contacts);
    },
    markArchived: function(data) {
      const contacts = Ember.isArray(data) ? data : [data];
      contacts.forEach(contact => contact.markArchived());
      this._changeContactStatus(contacts);
    },
    markBlocked: function(data) {
      const contacts = Ember.isArray(data) ? data : [data];
      contacts.forEach(contact => contact.markBlocked());
      this._changeContactStatus(contacts);
    },

    // Tag
    // ---

    initializeNewTag: function() {
      this.controller.set(
        'newTag',
        this.store.createRecord('tag', {
          language: this.get('stateManager.owner.phone.content.language')
        })
      );
    },
    createTag: function(tag, then = undefined) {
      return this.get('dataHandler')
        .persist(tag)
        .then(() => {
          const model = this.get('currentModel');
          model.get('phone').then(phone => {
            phone.get('tags').then(tags => tags.pushObject(tag));
          });
          callIfPresent(then);
        });
    },
    updateTagMemberships: function(tags, contact, then = undefined) {
      const contacts = Ember.isArray(contact) ? contact : [contact];
      return this.get('dataHandler')
        .persist(tags)
        .then(() => {
          const promises = contacts.map(contact => contact.reload());
          Ember.RSVP.all(promises).then(() => {
            callIfPresent(then);
          }, this.get('dataHandler').buildErrorHandler());
        });
    },

    // Compose
    // -------

    composeWithRecipients: function(data) {
      this.controller.set('selectedRecipients', Ember.copy(data));
      this.send('openSlideout', 'slideouts/compose', 'main');
    },
    initializeCompose: function() {
      const recipients = this.controller.get('selectedRecipients');
      if (!recipients) {
        this.controller.set('selectedRecipients', []);
      }
      this.controller.set('composeMessage', '');
    },
    cleanCompose: function() {
      this.controller.set('composeMessage', null);
      this.controller.set('selectedRecipients', []);
    },

    // Call
    // ----

    initializeCallSlideout: function() {
      this.controller.setProperties({
        isCallingForNumber: false,
        callByNumber: null,
        callByNumberIsValid: false,
        callByNumberContact: null,
        callByNumberMoreNum: 0
      });
    },
    onCallNumberChange: function(number) {
      const controller = this.controller;
      controller.set('callByNumber', number);
      debounce(this, this._validateAndCheckCallNumberForName, number, 250);
    },
    validateAndCheckCallNumberForName: function(number /*, event*/) {
      debounce(this, this._validateAndCheckCallNumberForName, number, 250);
    },
    makeCallForNumber: function(...then) {
      return new Promise((resolve, reject) => {
        const controller = this.controller;
        if (!controller.get('callByNumberIsValid')) {
          return resolve();
        }
        const newNum = controller.get('callByNumber'),
          forTarget = controller.get('callByNumberContact'),
          dataHandler = this.get('dataHandler'),
          doNext = contact => {
            dataHandler.makeCall(contact).then(
              () => {
                controller.set('isCallingForNumber', false);
                then.forEach(func => {
                  // async-button adds on this function and if this function
                  // is called, then an error saying that we tried to call
                  // set on a destroyed object is raised.
                  if (func.name !== 'deprecatingCallbackHandler') {
                    callIfPresent(func);
                  }
                });
                next(this, () => {
                  this.transitionTo('main.contacts.contact', contact.get('id'), {
                    queryParams: {
                      filter: 'all'
                    }
                  }).then(targetRoute => {
                    targetRoute.controller.set('isMakingCall', true);
                  });
                });
                resolve();
              },
              failure => {
                reject(failure);
              }
            );
          };
        controller.set('isCallingForNumber', true);
        if (isPresent(forTarget)) {
          doNext(forTarget);
        } else {
          const newContact = this.store.createRecord('contact', {
            numbers: [
              {
                number: newNum
              }
            ]
          });
          dataHandler.persist(newContact).then(() => {
            const contacts = controller.get('contacts');
            if (contacts) {
              contacts.unshiftObject(newContact);
              doNext(newContact);
            }
          }, reject);
        }
      });
    },

    // Communications
    // --------------

    sendMessage: function(msg, recipients, ...then) {
      return this.get('dataHandler')
        .sendMessage(msg, recipients)
        .then(() => then.forEach(callIfPresent));
    },
    makeCall: function(recipient, ...then) {
      return this.get('dataHandler')
        .makeCall(recipient)
        .then(() => then.forEach(callIfPresent));
    },

    // Availability
    // ------------

    onAvailabilityEntitySwitch(entity) {
      return new Promise((resolve, reject) => {
        const isManualSchedule = entity.get('manualSchedule');
        if (isManualSchedule === false) {
          entity.get('schedule').then(sched1 => {
            if (!sched1) {
              entity.set('schedule', this.store.createRecord('schedule'));
            }
            resolve();
          }, reject);
        } else {
          resolve();
        }
      });
    },

    // Feedback
    // --------

    cleanFeedback: function() {
      this.controller.set('feedbackMessage', null);
    }
  },

  // Helpers
  // -------

  _validateAndCheckCallNumberForName: function(number) {
    const controller = this.controller,
      maxNum = 30, // we want some options in case the earlier contacts are view-only
      cleaned = cleanNumber(number);
    if (validateNumber(cleaned)) {
      this._searchContactsByNumber(cleaned, {
        max: maxNum
      }).then(results => {
        const noViewOnlyContacts = results.toArray().filterBy('isSharedView', false),
          total = noViewOnlyContacts.length;
        controller.setProperties({
          callByNumber: cleaned,
          callByNumberContact: noViewOnlyContacts.get('firstObject'),
          callByNumberMoreNum: Math.max(total - 1, 0), // this is an approx total
          callByNumberIsValid: true
        });
      });
    } else {
      controller.setProperties({
        callByNumber: cleaned,
        callByNumberIsValid: false,
        callByNumberContact: null,
        callByNumberMoreNum: 0
      });
    }
  },
  _searchContactsByNumber: function(number, params = Object.create(null)) {
    return new Promise((resolve, reject) => {
      const teamId = this.get('stateManager.ownerAsTeam.id');
      params.search = number;
      if (teamId) {
        params.teamId = teamId;
      }
      this.store.query('contact', params).then(resolve, reject);
    });
  },
  _changeContactStatus: function(contacts) {
    this.get('dataHandler')
      .persist(contacts)
      .then(updatedContacts => {
        this.controller.notifyPropertyChange('contacts');
        updatedContacts.forEach(cont => cont.set('isSelected', false));
      });
  },
  _loadOtherStaff: function(model) {
    const shareQuery = Object.create(null);
    shareQuery.max = 100;
    shareQuery.status = ['STAFF', 'ADMIN'];
    if (model.get('constructor.modelName') === 'team') {
      shareQuery.teamId = model.get('id');
    } else {
      shareQuery.canShareStaffId = model.get('id');
    }
    this.store.query('staff', shareQuery).then(result => {
      this.get('stateManager').set('relevantStaffs', result.toArray());
    }, this.get('dataHandler').buildErrorHandler());
  }
});
