import defaultIfAbsent from '../../utils/default-if-absent';
import Ember from 'ember';

export default Ember.Component.extend({
  value: defaultIfAbsent(true),

  falseString: defaultIfAbsent('No'),
  trueString: defaultIfAbsent('Yes'),

  falseColor: defaultIfAbsent('#d3d3d3'),
  trueColor: defaultIfAbsent('#76c9ec'),

  onFalse: null,
  onTrue: null,

  actions: {
    onFalse() {
      const onFalse = this.get('onFalse');
      if (onFalse) {
        onFalse();
      } else {
        this.set('value', false);
      }
    },
    onTrue() {
      const onTrue = this.get('onTrue');
      if (onTrue) {
        onTrue();
      } else {
        this.set('value', true);
      }
    }
  }
});
