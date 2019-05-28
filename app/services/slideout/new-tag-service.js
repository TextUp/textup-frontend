import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import PropertyUtils from 'textup-frontend/utils/property';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly, empty } from '@ember/object/computed';

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
  noExistingTags: empty('existingTags'),
  slideoutTitle: computed('noExistingTags', function() {
    return this.get('noExistingTags') ? 'New Tag' : 'Tags';
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
    AppUtils.tryRollback(this.get('newTag'));
    this.get('slideoutService').closeSlideout();
  },
  cancelCreateInTagList() {
    AppUtils.tryRollback(this.get('newTag'));
    PropertyUtils.callIfPresent(this.get('tagsListHideAway.actions.close'));
  },

  finishNewTagSlideout() {
    return this._tryPersistNewTag().then(() => this.get('slideoutService').closeSlideout());
  },
  finishCreateInTagList() {
    return this._tryPersistNewTag().then(() =>
      PropertyUtils.callIfPresent(this.get('tagsListHideAway.actions.close'))
    );
  },

  // Internal
  // --------

  _tryPersistNewTag() {
    return this.get('tagService')
      .persistNew(this.get('newTag'))
      .then(() => this.get('tutorialService').startCompleteTask(Constants.TASK.TAG));
  },
});
