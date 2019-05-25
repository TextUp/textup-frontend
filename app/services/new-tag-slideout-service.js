import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly, empty } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';

export default Service.extend({
  slideoutService: service(),
  stateService: service(),
  tagService: service(),
  tutorialService: service(),

  // Properties
  // ----------

  existingTags: readOnly('stateService.owner.phone.content.tags'),
  newTag: null,
  tagsListHideAway: null,
  shouldForceKeepOpen: readOnly('newTag.isSaving'),
  shouldDisablePrimaryAction: readOnly('newTag.validations.isInvalid'),
  hasExistingTags: empty('existingTags'),
  slideoutTitle: computed('hasExistingTags', function() {
    return this.get('hasExistingTags') ? 'Tags' : 'New Tag';
  }),

  // Methods
  // -------

  openNewTagSlideout() {
    this.setProperties({
      newTag: this.get('tagService').createNew(),
      tagsListHideAway: null,
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/tag/create',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  openTagListSlideout() {
    this.setProperties({ newTag: null, tagsListHideAway: null });
    this.get('slideoutService').toggleSlideout(
      'slideouts/tag/list',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  onOpenCreateInTagList() {
    this.set('newTag', this.get('tagService').createNew());
  },

  cancelSlideout() {
    this._tryRevertNewTag();
    this.get('slideoutService').closeSlideout();
  },
  cancelCreateInTagList() {
    this._tryRevertNewTag();
    const hideAway = this.get('tagsListHideAway');
    if (hideAway && hideAway.actions) {
      tryInvoke(hideAway.actions, 'close');
    }
  },

  finishNewTagSlideout() {
    return this._tryPersistNewTag().then(() => this.cancelSlideout());
  },
  finishCreateInTagList() {
    return this._tryPersistNewTag().then(() => this.cancelCreateInTagList());
  },

  // Internal
  // --------

  _tryRevertNewTag() {
    const newTag = this.get('newTag');
    if (newTag) {
      newTag.rollbackAttributes();
    }
  },
  _tryPersistNewTag() {
    return this.get('tagService')
      .persistNewAndTryAddToPhone(this.get('newTag'))
      .then(() => this.get('tutorialService').startCompleteTask(Constants.TASK.TAG));
  },
});
