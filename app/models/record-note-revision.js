import { computed } from '@ember/object';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import HasAuthor from 'textup-frontend/mixins/model/has-author';

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
  media: DS.belongsTo('media'), // hasOne
});
