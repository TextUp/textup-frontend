import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  mediaService: service(),

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
