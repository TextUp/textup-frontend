import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  attrs: { name: { serialize: false } },
});
