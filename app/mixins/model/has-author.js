import Mixin from '@ember/object/mixin';
import DS from 'ember-data';

export default Mixin.create({
  authorName: DS.attr('string'),
  authorId: DS.attr('number'),
  authorType: DS.attr('string')
});
