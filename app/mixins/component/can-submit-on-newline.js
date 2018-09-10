import Ember from 'ember';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

// From http://stackoverflow.com/questions/20836402/
//    do-not-type-newline-when-enter-pressed-in-textarea-in-emberjs

export default Ember.Mixin.create({
  submitOnNewline: defaultIfAbsent(false),
  action: defaultIfAbsent(null), // triggered by browser

  keyDown: function(event) {
    if (this.get('submitOnNewline')) {
      if (event.which === 13 && !event.shiftKey) {
        // if we press enter without the shift modifier, then
        // don't insert a newline and instead trigger the action
        event.preventDefault();
      }
    }
  },
  insertNewline: function(event) {
    if (this.get('submitOnNewline')) {
      // if we do not press the shift key, then submit
      // if we DO press the shift key, then insert newline
      if (!event.shiftKey) {
        this._super(event);
      }
    }
  }
});
