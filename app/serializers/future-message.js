import DS from 'ember-data';
import Ember from 'ember';
import HasMedia from '../mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasMedia, {
  attrs: {
    whenCreated: { serialize: false },
    nextFireDate: { serialize: false },
    isDone: { serialize: false },
    timesTriggered: { serialize: false },
    isRepeating: { serialize: false },
    hasEndDate: { serialize: false },
    contact: { serialize: false },
    tag: { serialize: false },
    _repeatIntervalInDays: { key: 'repeatIntervalInDays', serialize: true }
  },

  payloadKeyFromModelName: function(modelName) {
    return Ember.String.dasherize(modelName);
  },

  serialize: function(snapshot) {
    const json = this._super(...arguments),
      model = snapshot.record;

    if (model.get('isRepeating')) {
      if (model.get('hasEndDate')) {
        json.repeatCount = null;
      } else {
        json.endDate = null;
      }
    } else {
      delete json.repeatIntervalInDays;
      delete json.repeatCount;
      delete json.endDate;
    }

    return json;
  }
});
