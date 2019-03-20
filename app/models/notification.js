import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import { urlIdent } from 'textup-frontend/utils/property';

const { computed } = Ember;

export default DS.Model.extend(Dirtiable, {
  name: DS.attr('string'),
  phoneNumber: DS.attr('phone-number'),

  type: DS.attr('string'),
  [Constants.PROP_NAME.URL_IDENT]: computed('_ownerModelName', 'id', function() {
    return urlIdent(this.get('_ownerModelName'), this.get('id'));
  }),

  numIncoming: computed('numVoicemail', 'numIncomingText', 'numIncomingCall', function() {
    return this.get('numVoicemail') + this.get('numIncomingText') + this.get('numIncomingCall');
  }),
  numVoicemail: DS.attr('number', { defaultValue: 0 }),
  numIncomingText: DS.attr('number', { defaultValue: 0 }),
  numIncomingCall: DS.attr('number', { defaultValue: 0 }),

  numOutgoing: computed('numOutgoingText', 'numOutgoingCall', function() {
    return this.get('numOutgoingText') + this.get('numOutgoingCall');
  }),
  numOutgoingText: DS.attr('number', { defaultValue: 0 }),
  numOutgoingCall: DS.attr('number', { defaultValue: 0 }),

  details: DS.hasMany('notification-detail'),

  // Internal properties
  // -------------------

  _ownerModelName: computed('type', function() {
    return this.get('type') === 'GROUP' ? Constants.MODEL.TEAM : Constants.MODEL.STAFF;
  }),
});
