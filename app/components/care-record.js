import Component from '@ember/component';
import MediaElement from 'textup-frontend/models/media-element';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCluster from 'textup-frontend/objects/record-cluster';
import { computed } from '@ember/object';
import { format } from 'textup-frontend/utils/phone-number';
import { join, scheduleOnce } from '@ember/runloop';
import { notEmpty } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    // Properties
    // ----------

    // for modifying available functionality
    canAddToRecord: PropTypes.bool,
    canModifyExistingInRecord: PropTypes.bool,
    nextFutureFire: PropTypes.oneOfType([PropTypes.null, PropTypes.date]),
    personalNumber: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    // for displaying existing items
    recordClusters: PropTypes.arrayOf(PropTypes.instanceOf(RecordCluster)),
    numRecordItems: PropTypes.number,
    totalNumRecordItems: PropTypes.oneOfType([PropTypes.null, PropTypes.number]),
    // for creating a new text
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    audio: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    contents: PropTypes.string,

    // Handlers
    // --------

    doRegister: PropTypes.func,
    // call-specific handlers
    onEndOngoingCall: PropTypes.func,
    // note-specific handlers
    onEditNote: PropTypes.func,
    onRestoreNote: PropTypes.func,
    onViewNoteHistory: PropTypes.func,
    // record display handlers
    onLoadRecordItems: PropTypes.func,
    onRefreshRecordItems: PropTypes.func,
    onViewScheduledMessages: PropTypes.func,
    // content-related handlers
    onContentChange: PropTypes.func,
    onAddImage: PropTypes.func,
    onAddAudio: PropTypes.func,
    onRemoveMedia: PropTypes.func,
    onOptionsClose: PropTypes.func,
    // record modification handlers
    onAddNote: PropTypes.func,
    onCall: PropTypes.func,
    onText: PropTypes.func,
    onScheduleMessage: PropTypes.func,

    // Display
    // -------

    noRecordItemsMessage: PropTypes.string,
    noAddToRecordMessage: PropTypes.string,
    startCallMessage: PropTypes.string,
    addNoteInPastMessage: PropTypes.string,
  }),
  getDefaultProps() {
    return {
      canAddToRecord: false,
      canModifyExistingInRecord: false,
      recordClusters: [],
      noRecordItemsMessage: 'Nothing in the record yet!',
      noAddToRecordMessage: "You don't have permission to add to this record.",
      startCallMessage: `Calling your personal phone at ${format(this.get('personalNumber'))}`,
      addNoteInPastMessage: "Choose your note's place",
    };
  },
  classNames: 'care-record',

  init() {
    this._super(...arguments);
    join(() =>
      scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]))
    );
  },

  // Internal properties
  // -------------------

  _recordClustersScroll: null, // set by `doRegister` in `infinite-scroll`
  _publicAPI: computed(function() {
    return {
      actions: {
        restorePosition: this._tryRestorePosition.bind(this),
        resetAll: this._tryResetAll.bind(this),
      },
    };
  }),

  _hasPersonalNumber: notEmpty('personalNumber'),
  _hasItemsInRecord: notEmpty('recordClusters'),

  _hasStartedCall: false,
  _isAddingNoteInPast: false,

  // Internal handlers
  // -----------------

  // record modification handlers
  _addNoteInPast(addAfterRecordItem) {
    this.set('_isAddingNoteInPast', false);
    tryInvoke(this, 'onAddNote', [addAfterRecordItem]);
  },
  _addNoteNow() {
    tryInvoke(this, 'onAddNote', [...arguments]);
  },
  _onCall() {
    this.set('_hasStartedCall', true);
    return PropertyUtils.ensurePromise(tryInvoke(this, 'onCall', [...arguments])).then(() =>
      this._tryResetScroll()
    );
  },
  _onText() {
    return PropertyUtils.ensurePromise(tryInvoke(this, 'onText', [...arguments])).then(() =>
      this._tryResetScroll()
    );
  },

  _tryResetAll() {
    PropertyUtils.callIfPresent(this.get('_recordClustersScroll.actions.resetAll'));
  },
  _tryRestorePosition(shouldAnimate = false) {
    PropertyUtils.callIfPresent(this.get('_recordClustersScroll.actions.restorePosition'), [
      shouldAnimate,
    ]);
  },
  _tryResetScroll() {
    PropertyUtils.callIfPresent(this.get('_recordClustersScroll.actions.resetPosition'), [true]);
  },
});
