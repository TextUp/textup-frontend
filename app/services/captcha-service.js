import $ from 'jquery';
import Service from '@ember/service';
import RSVP from 'rsvp';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';

export default Service.extend({
  isValid(captchaKey) {
    return new RSVP.Promise((resolve, reject) => {
      $.ajax({
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
