import Mixin from '@ember/object/mixin';

export default Mixin.create({
  attrs: {
    lastRecordActivity: { serialize: false },
    language: { serialize: true },
    _recordItems: { serialize: false }
  }
});
