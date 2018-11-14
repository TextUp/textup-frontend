import Ember from 'ember';

export default Ember.Mixin.create({
  mediaService: Ember.inject.service(),

  actions: {
    onAddImage() {
      return this.get('mediaService').addImage(...arguments);
    },
    onAddAudio() {
      return this.get('mediaService').addAudio(...arguments);
    },
    onRemoveMedia() {
      return this.get('mediaService').removeMedia(...arguments);
    }
  }
});
