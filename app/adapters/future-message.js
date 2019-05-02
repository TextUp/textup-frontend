import ApplicationAdapter from 'textup-frontend/adapters/application';
import Ember from 'ember';

const { dasherize, pluralize } = Ember.String;

export default ApplicationAdapter.extend({
  pathForType(modelName) {
    return pluralize(dasherize(modelName));
  },
  buildURL(modelName, id, snapshot, requestType) {
    const obj = snapshot && snapshot.record;
    let url = this._super(...arguments);

    if (obj && requestType === 'createRecord') {
      if (obj.get('contact.id')) {
        url = this._addQueryParam(url, 'contactId', obj.get('contact.id'));
      }
      if (obj.get('tag.id')) {
        url = this._addQueryParam(url, 'tagId', obj.get('tag.id'));
      }
    }

    return url;
  },
});
