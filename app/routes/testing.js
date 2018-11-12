import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller) {
    this._super(...arguments);

    const el1 = this.store.createFragment('media-element');
    el1.addVersion(
      'audio/mpeg',
      'http://com.twilio.music.electronica.s3.amazonaws.com/Kaer_Trouz_-_Seawall_Stepper.mp3'
    );
    controller.set('audio', [el1]);
  },
  actions: {
    onAdd() {
      console.log('onAdd arguments', arguments);

      const el1 = this.store.createFragment('media-element');
      el1.addVersion(...arguments);
      this.get('controller.audio').pushObject(el1);
    },
    onRemove() {
      console.log('onRemove arguments', arguments);
    }
  }
});
