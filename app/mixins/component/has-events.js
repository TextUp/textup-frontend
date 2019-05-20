import Mixin from '@ember/object/mixin';

export default Mixin.create({
  _event(name = '', namespace = null) {
    const ns = namespace || this.elementId;
    return `${name}.${ns}`;
  }
});
