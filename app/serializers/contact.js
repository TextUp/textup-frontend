import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';
import OwnsFutureMessages from 'textup-frontend/mixins/serializer/owns-future-messages';
import OwnsRecordItems from 'textup-frontend/mixins/serializer/owns-record-items';
import Shareable from 'textup-frontend/mixins/serializer/shareable';

export default DS.RESTSerializer.extend(
  DS.EmbeddedRecordsMixin,
  OwnsRecordItems,
  OwnsFutureMessages,
  Shareable,
  {
    attrs: {
      [Constants.PROP_NAME.SHARING_PHONE_ID_BUCKETS]: { key: 'sharedWith', serialize: false },
      numbers: { serialize: false },
      phone: { serialize: false },
      sharedByName: { serialize: false },
      sharedByPhoneId: { serialize: false },
      tags: { deserialize: 'records', serialize: false },
      unreadInfo: { serialize: false },
      whenCreated: { serialize: false },
    },
    serialize(snapshot) {
      const json = this._super(...arguments),
        changed = snapshot.changedAttributes(),
        numChange = Ember.get(changed, 'numbers'),
        actions = snapshot.record.get('actions');
      if (numChange) {
        json.doNumberActions = this._buildNumberActions(numChange[0] || [], numChange[1]);
      }
      if (Ember.isPresent(actions)) {
        json.doShareActions = actions.map(this._convertToShareAction);
        actions.clear();
      }
      return snapshot.record.get('isViewPermission') ? { status: json.status } : json;
    },

    // Sharing
    // -------

    _convertToShareAction(action) {
      if (!action) {
        return action;
      }
      if (action.action && action.action.toUpperCase() !== Constants.ACTION.SHARE.STOP) {
        action.permission = action.action;
        action.action = Constants.ACTION.SHARE.MERGE;
      }
      action.id = action.bucketId;
      delete action.bucketId;
      delete action.itemId;
      return action;
    },

    // Numbers
    // -------

    _buildNumberActions(originalNumbers, newNumbers) {
      const doNumberActions = [];
      // merge numbers
      newNumbers.forEach((numObj, index) => {
        const number = Ember.get(numObj, 'number'),
          foundNum = originalNumbers.findBy('number', number);
        if (foundNum) {
          const oldIndex = originalNumbers.indexOf(foundNum);
          if (oldIndex !== index) {
            doNumberActions.pushObject(this._mergeNumber(number, index));
          }
        } else {
          // a new number
          doNumberActions.pushObject(this._mergeNumber(number, index));
        }
      });
      // delete numbers
      originalNumbers.forEach(numObj => {
        const number = Ember.get(numObj, 'number'),
          stillExists = newNumbers.findBy('number', number);
        if (!stillExists) {
          doNumberActions.pushObject(this._deleteNumber(number));
        }
      });
      return doNumberActions;
    },
    _mergeNumber(number, preference) {
      return {
        number: number,
        preference: preference,
        action: Constants.ACTION.NUMBER.MERGE,
      };
    },
    _deleteNumber(number) {
      return {
        number: number,
        action: Constants.ACTION.NUMBER.DELETE,
      };
    },
  }
);
