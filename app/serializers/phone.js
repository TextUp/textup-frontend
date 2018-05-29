import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    number: {
      serialize: false
    },
    tags: {
      deserialize: 'records',
      serialize: false // any changes happen with tagActions on the individual tags
    },
    mandatoryEmergencyMessage: {
      serialize: false
    },
    availability: {
      deserialize: 'records',
      serialize: 'records'
    },
    others: {
      deserialize: 'records',
      serialize: false
    }
  }
});
