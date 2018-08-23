import Ember from 'ember';

export default Ember.Mixin.create({
  attrs: {
    lastRecordActivity: { serialize: false },
    language: { serialize: true },
    _recordItems: { serialize: false },
    _recordTexts: { serialize: false },
    _recordCalls: { serialize: false },
    _recordNotes: { serialize: false }
  }
});
