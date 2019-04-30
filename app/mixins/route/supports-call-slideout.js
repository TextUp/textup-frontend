import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { run } = Ember;

export default Ember.Mixin.create({
  callSlideoutService: Ember.inject.service(),
  tutorialService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialCallSlideoutProps());
  },

  actions: {
    startCallSlideout() {
      this.get('controller').setProperties(this._initialCallSlideoutProps());
      this.send(
        'toggleSlideout',
        'slideouts/call',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    cancelCallSlideout() {
      this.send('closeSlideout');
    },
    finishCallSlideout() {
      const controller = this.get('controller');
      if (!controller.get('callByNumberIsValid')) {
        return;
      }
      controller.set('isCallingForNumber', true); // force keep open
      const callByNumber = controller.get('callByNumber'),
        callByNumberContact = controller.get('callByNumberContact');
      return this.get('callSlideoutService')
        .makeCall(callByNumberContact, callByNumber)
        .then(contact => {
          this.get('tutorialService').startCompleteTask(Constants.TASK.CALL);
          controller.set('isCallingForNumber', false);
          this.send('closeSlideout');
          run.next(() => {
            this.transitionTo('main.contacts.contact', contact.get('id'), {
              queryParams: { filter: Constants.CONTACT.FILTER.ALL },
            }).then(() => this._afterStartCall(contact));
          });
        });
    },

    onCallNumberChange(number) {
      const controller = this.get('controller'),
        callSlideoutService = this.get('callSlideoutService');
      controller.set('callByNumber', number);
      callSlideoutService.validateAndCheckForName(number, { ctx: controller });
    },
  },

  _initialCallSlideoutProps() {
    return {
      callByNumber: null,
      callByNumberContact: null,
      callByNumberIsValid: false,
      callByNumberMoreNum: 0,
      isCallingForNumber: false,
    };
  },
  _afterStartCall(contact) {
    this.notifications.success(
      `Calling your personal phone number to connect you to ${contact.get('name')}.`
    );
  },
});
