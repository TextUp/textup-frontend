import Ember from 'ember';

export default Ember.Mixin.create({
  _event(name = '', namespace = null) {
    const ns = namespace || this.elementId;
    return `${name}.${ns}`;
  }
});
