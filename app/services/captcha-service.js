import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Service.extend({
  isValid(captchaKey) {
    return new RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        type: Constants.REQUEST_METHOD.POST,
        url: config.captcha.endpoint,
        contentType: Constants.MIME_TYPE.JSON,
        data: JSON.stringify({
          key: captchaKey,
          location: config.captcha.location,
        }),
      }).then(resolve, reject);
    });
  },
});
