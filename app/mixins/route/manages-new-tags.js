import Ember from 'ember';

const { tryInvoke } = Ember;

export default Ember.Mixin.create({
  tagService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      tagsListHideAway: null,
      newTag: null
    });
  },

  actions: {
    startNewTagSlideout() {
      this.controller.set('newTag', this.get('tagService').createNew());
      this.send(
        'toggleSlideout',
        'slideouts/tag/create',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
      );
    },
    cancelNewTagSlideout() {
      this.send('closeSlideout');
      this._tryRevertNewTag();
    },
    finishNewTagSlideout() {
      this.get('tagService')
        .persistNew(this.controller.get('newTag'), { model: this.get('currentModel') })
        .then(() => this.send('closeSlideout'));
    },

    startTagListSlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/tag/list',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
      );
    },
    closeTagListSlideout() {
      this.send('closeSlideout');
      this._tryRevertNewTag();
    },

    onOpenCreateTagInTagList() {
      this.controller.set('newTag', this.get('tagService').createNew());
    },
    onCloseCreateTagInTagList() {
      this._tryRevertNewTag();
    },
    cancelCreateTagInTagList() {
      this._tryRevertNewTag();
      this._tryCloseTagsListHideAway();
    },
    finishCreateTagInTagList() {
      this.get('tagService')
        .persistNew(this.controller.get('newTag'), { model: this.get('currentModel') })
        .then(() => this._tryCloseTagsListHideAway());
    }
  },

  _tryRevertNewTag() {
    const newTag = this.controller.get('newTag');
    if (newTag) {
      newTag.rollbackAttributes();
    }
  },
  _tryCloseTagsListHideAway() {
    const tagsListHideAway = this.controller.get('tagsListHideAway');
    if (tagsListHideAway && tagsListHideAway.actions) {
      tryInvoke(tagsListHideAway.actions, 'close');
    }
  }
});
