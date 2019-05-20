import { computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import OwnsRecordItems from 'textup-frontend/mixins/model/owns-record-items';
import { urlIdent } from 'textup-frontend/utils/property';

export default DS.Model.extend(Dirtiable, OwnsRecordItems, {
  name: DS.attr('string'),
  isTag: DS.attr('boolean'),

  routeName: computed('isTag', function() {
    return this.get('isTag') ? 'main.tag.details' : 'main.contacts.contact';
  }),
  [Constants.PROP_NAME.URL_IDENT]: computed('isTag', 'id', function() {
    const id = this.get('id');
    return this.get('isTag') ? urlIdent(Constants.MODEL.TAG, id) : id;
  }),
});
