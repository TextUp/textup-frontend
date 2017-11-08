import Ember from 'ember';
import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    numMembers: {
      serialize: false
    },
    futureMessages: {
      deserialize: 'records',
      serialize: false //any changes happen in tag's tagActions
    },
    unsortedRecords: {
      serialize: false //any changes happen at records endpoint
    },
    phone: {
      serialize: false
    },
    lastRecordActivity: {
      serialize: false
    }
  },

  serialize: function(snapshot) {
    const json = this._super(...arguments),
      actions = snapshot.record.get('actions');
    if (actions) {
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
});
