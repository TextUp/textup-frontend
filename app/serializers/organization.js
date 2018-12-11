import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    numAdmins: { serialize: false },
    location: { deserialize: 'records', serialize: 'records' },
    //any changes happen with teamActions on the individual teams
    teams: { deserialize: 'records', serialize: false },
    timeoutMin: { serialize: false },
    timeoutMax: { serialize: false },
    awayMessageSuffixMaxLength: { serialize: false }
  }
});
