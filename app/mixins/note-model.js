import DS from 'ember-data';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, computed: { notEmpty, and, none } } = Ember,
  // if note, must have at least one of noteContents, location or images
  Validations = buildValidations({
    noteContents: {
      description: 'Note contents',
      validators: [
        validator('length', {
          max: 1000
        }),
        validator('presence', {
          presence: true,
          debounce: 500,
          dependentKeys: ['isNote', 'hasLocation', 'hasImages'],
          disabled: function() {
            const model = this.get('model');
            return !model.get('isNote') || model.get('hasLocation') || model.get('hasImages');
          }
        })
      ]
    },
    location: {
      description: 'Location',
      validators: [
        validator('belongs-to'),
        validator('presence', {
          presence: true,
          debounce: 500,
          dependentKeys: ['isNote', 'noteContents', 'hasImages'],
          disabled: function() {
            const model = this.get('model');
            return !model.get('isNote') || model.get('noteContents') || model.get('hasImages');
          }
        })
      ]
    },
    images: {
      description: 'Images',
      validators: [
        validator('presence', {
          presence: true,
          debounce: 500,
          dependentKeys: ['images.[]', 'isNote', 'noteContents', 'hasLocation'],
          disabled: function() {
            const model = this.get('model');
            return !model.get('isNote') || model.get('noteContents') || model.get('hasLocation');
          }
        })
      ]
    }
  });

export default Ember.Mixin.create(Validations, {
  // Rolling back
  // ------------

  _reset() {
    const location = this.get('location.content');
    if (location && location.get('isNew')) {
      location.rollbackAttributes();
      // not strictly necessary because rolling back a new model automatically removes it
      // and all references to it, but in future Ember versions rolling back behavior
      // changes and not sure if this implicit behavior will remain
      this.set('location', null);
    }
  },

  // Attributes
  // ----------

  type: DS.attr('string', {
    defaultValue: null // if null, then note
  }),
  authorName: DS.attr('string'),
  authorId: DS.attr('number'),
  authorType: DS.attr('string'),

  whenChanged: DS.attr('date'),
  noteContents: DS.attr('string'),
  location: DS.belongsTo('location'),
  images: DS.attr('image-collection', {
    defaultValue: () => []
  }),

  // Computed properties
  // -------------------

  isNote: none('type'),

  hasLocation: notEmpty('location.content'),
  hasImages: notEmpty('images'),
  hasLocationAndImages: and('hasLocation', 'hasImages'),
  hasNeitherLocationNorImages: computed('hasLocation', 'hasImages', function() {
    return !this.get('hasLocation') && !this.get('hasImages');
  }),

  imageLinks: computed('images.[]', function() {
    return this.get('images').mapBy('link');
  })
});
