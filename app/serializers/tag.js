import Ember from 'ember';
import DS from 'ember-data';
import OwnsFutureMessages from '../mixins/serializer/owns-future-messages';
import OwnsRecordItems from '../mixins/serializer/owns-record-items';

export default DS.RESTSerializer.extend(
  DS.EmbeddedRecordsMixin,
  OwnsFutureMessages,
  OwnsRecordItems,
  {
    attrs: {
      numMembers: { serialize: false },
      phone: { serialize: false }
    },

    serialize: function(snapshot) {
      const json = this._super(...arguments),
        actions = snapshot.record.get('actions');
      if (Ember.isPresent(actions)) {
        json.doTagActions = actions.map(this._convertToTagAction);
      }
      return json;
    },

    // Helpers
    // -------

    _convertToTagAction: function(action) {
      if (!action) {
        return action;
      }
      const convertedAction = {};
      Ember.merge(convertedAction, action);
      convertedAction.id = action.itemId;
      delete convertedAction.bucketId;
      delete convertedAction.itemId;
      return convertedAction;
    }
  }
);
