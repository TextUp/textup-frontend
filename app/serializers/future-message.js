import { dasherize } from '@ember/string';
import DS from 'ember-data';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

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
    _repeatIntervalInDays: { key: 'repeatIntervalInDays', serialize: true },
  },

  payloadKeyFromModelName(modelName) {
    return dasherize(modelName);
  },

  serialize(snapshot) {
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
  },
});
