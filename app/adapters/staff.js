import ApplicationAdapter from 'textup-frontend/adapters/application';
import LocaleUtils from 'textup-frontend/utils/locale';

export default ApplicationAdapter.extend({
  buildURL() {
    const url = this._super(...arguments);
    return this._addQueryParam(url, 'timezone', LocaleUtils.getTimezone());
  },
});
