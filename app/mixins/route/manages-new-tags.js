import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { tryInvoke } = Ember;

export default Ember.Mixin.create({
  tagService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      tagsListHideAway: null,
      newTag: null,
    });
  },

  actions: {
    startNewTagSlideout() {
      this.controller.set('newTag', this.get('tagService').createNew());
      this.send(
        'toggleSlideout',
        'slideouts/tag/create',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    cancelNewTagSlideout() {
      this.send('closeSlideout');
      this._tryRevertNewTag();
    },
    finishNewTagSlideout() {
      return this.get('tagService')
        .persistNew(this.controller.get('newTag'), { model: this.get('currentModel') })
        .then(() => this.send('closeSlideout'));
    },

    startTagListSlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/tag/list',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
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
      return this.get('tagService')
        .persistNew(this.controller.get('newTag'), { model: this.get('currentModel') })
        .then(() => this._tryCloseTagsListHideAway());
    },
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
  },
});
