import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasAuthor from '../mixins/model/has-author';

const { computed } = Ember;

export default DS.Model.extend(Dirtiable, HasAuthor, {
  // Overrides
  // ---------

  hasManualChanges: computed('media.isDirty', 'location.isDirty', function() {
    return this.get('media.isDirty') || this.get('location.isDirty');
  }),

  // Properties
  // ----------

  whenChanged: DS.attr('date'),
  noteContents: DS.attr('string'),

  location: DS.belongsTo('location'), // hasOne
  media: DS.belongsTo('media') // hasOne
});
