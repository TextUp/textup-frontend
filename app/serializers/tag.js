import { merge } from '@ember/polyfills';
import { isPresent } from '@ember/utils';
import DS from 'ember-data';
import OwnsFutureMessages from 'textup-frontend/mixins/serializer/owns-future-messages';
import OwnsRecordItems from 'textup-frontend/mixins/serializer/owns-record-items';

export default DS.RESTSerializer.extend(
  DS.EmbeddedRecordsMixin,
  OwnsFutureMessages,
  OwnsRecordItems,
  {
    attrs: {
      numMembers: { serialize: false },
      phone: { serialize: false },
    },

    serialize(snapshot) {
      const json = this._super(...arguments),
        actions = snapshot.record.get('actions');
      if (isPresent(actions)) {
        json.doTagActions = actions.map(this._convertToTagAction);
      }
      return json;
    },

    // Helpers
    // -------

    _convertToTagAction(action) {
      if (!action) {
        return action;
      }
      const convertedAction = {};
      merge(convertedAction, action);
      convertedAction.id = action.itemId;
      delete convertedAction.bucketId;
      delete convertedAction.itemId;
      return convertedAction;
    },
  }
);
