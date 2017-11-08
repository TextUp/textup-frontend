import Ember from 'ember';
import config from '../../config/environment';

export default Ember.Route.extend({
  setupController: function(controller) {
    const signupController = this.controllerFor('signup'),
      newStaff = signupController.get('staff'),
      selected = signupController.get('selected');
    if (!selected || !newStaff) {
      this.transitionTo('signup.index');
    }
    controller.set('selected', selected);
    controller.set('staff', newStaff);
  },
  deactivate: function() {
    this.controller.set('confirmPassword', null);
  },

  actions: {
    // Captcha
    // -------

    clearCaptcha: function(staff) {
      const captcha = this.controller.get('gRecaptcha');
      if (captcha) {
        captcha.resetReCaptcha.call(captcha);
      }
      staff.set('captcha', '');
    },

    // Creating new staff
    // ------------------

    createStaff: function(data) {
      const { name, username, email, password, lockCode, captcha } = data.toJSON(),
        org = this.controller.get('selected'),
        toBeSaved = {
          staff: {
            name: name,
            username: username,
            password: password,
            email: email,
            lockCode: lockCode,
            captcha: captcha
          }
        };
      // build org based on if new or existing
      toBeSaved.staff.org = org.get('isNew')
        ? {
            name: org.get('name'),
            location: org.get('location.content').toJSON()
          }
        : {
            id: org.get('id')
          };
      // make the request
      return new Ember.RSVP.Promise((resolve, reject) => {
        const onFail = failure => {
          if (this.get('dataHandler').displayErrors(failure) === 0) {
            this.notifications.error(`Could not create new account.
              Please try again later.`);
          }
          this.send('clearCaptcha', data);
          reject(failure);
        };
        Ember.$
          .ajax({
            type: 'POST',
            url: `${config.host}/v1/public/staff`,
            contentType: 'application/json',
            data: JSON.stringify(toBeSaved)
          })
          .then(result => {
            this.notifications.success(`Almost done creating your account...`);
            const staff = this.store.push(this.store.normalize('staff', result.staff));
            this.get('authManager')
              .login(staff.get('username'), password)
              .then(() => {
                this.notifications.success(`Success! Welcome ${staff.get('name')}!`);
                this.transitionTo('none');
              }, onFail);
            resolve(result);
          }, onFail);
      });
    }
  }
});
