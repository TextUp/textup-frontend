import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        location: {
            deserialize: 'records',
            serialize: false
        },
    }
});
