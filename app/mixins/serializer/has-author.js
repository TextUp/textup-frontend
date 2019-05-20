import Mixin from '@ember/object/mixin';

export default Mixin.create({
  attrs: {
    authorName: { serialize: false },
    authorId: { serialize: false },
    authorType: { serialize: false }
  }
});
