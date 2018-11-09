import Ember from 'ember';

export default Ember.Mixin.create({
  _event(name = '') {
    return `${name}.${this.elementId}`;
  }
});
