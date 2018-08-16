import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create({
  authorName: DS.attr('string'),
  authorId: DS.attr('number'),
  authorType: DS.attr('string')
});
