import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  attrs: { staffId: { serialize: false }, name: { serialize: false } },
});
