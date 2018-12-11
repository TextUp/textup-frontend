import Ember from 'ember';
import DS from 'ember-data';
import OwnsPhone from 'textup-frontend/mixins/serializer/owns-phone';

const { assign, typeOf } = Ember;

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, OwnsPhone, {
  attrs: {
    numMembers: { serialize: false },
    org: { serialize: 'ids' }, // org is passed as id only for teams to avoid circular json
    location: { deserialize: 'records', serialize: 'records' }
  },

  serialize: function(snapshot) {
    const json = this._super(...arguments),
      actions = snapshot.record.get('actions');
    if (typeOf(actions) === 'array') {
      json.doTeamActions = actions.map(convertToTeamAction);
    }
    return json;
  }
});

function convertToTeamAction(action) {
  if (!action) {
    return action;
  }
  const copiedAction = assign({}, action);
  copiedAction.id = copiedAction.itemId;
  delete copiedAction.bucketId;
  delete copiedAction.itemId;
  return copiedAction;
}
