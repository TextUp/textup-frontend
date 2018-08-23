import Ember from 'ember';

export default Ember.Mixin.create({
  attrs: {
    authorName: { serialize: false },
    authorId: { serialize: false },
    authorType: { serialize: false }
  }
});
