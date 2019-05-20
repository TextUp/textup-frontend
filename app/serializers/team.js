import { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import { typeOf } from '@ember/utils';
import DS from 'ember-data';
import OwnsPhone from 'textup-frontend/mixins/serializer/owns-phone';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, OwnsPhone, {
  adminService: service(),

  attrs: {
    numMembers: { serialize: false },
    org: { serialize: 'ids' }, // org is passed as id only for teams to avoid circular json
    location: { deserialize: 'records', serialize: 'records' },
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      actions = snapshot.record.get('actions');
    json.staffId = this.get('adminService.editingStaffId');
    if (typeOf(actions) === 'array') {
      json.doTeamActions = actions.map(convertToTeamAction);
    }
    return json;
  },
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
