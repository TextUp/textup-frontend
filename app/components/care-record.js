import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    // Properties
    // ----------

    // for modifying available functionality
    canAddToRecord: PropTypes.bool,
    canModifyExistingInRecord: PropTypes.bool,
    nextFutureFire: PropTypes.date, // could be null
    personalPhoneNumber: PropTypes.string, // could be null
    // for displaying existing items
    recordClusters: PropTypes.arrayOf(PropTypes.instanceOf(RecordCluster)),
    numRecordItems: PropTypes.number,
    totalNumRecordItems: PropTypes.number, // don't know until after 1st async call so not required
    // for creating a new text
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaImage)),
    contents: PropTypes.string,

    // Handlers
    // --------

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
    onRemoveImage: PropTypes.func,
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
    addNoteInPastMessage: PropTypes.string
  },
  getDefaultProps() {
    return {
      canAddToRecord: false,
      canModifyExistingInRecord: false,
      recordClusters: [],
      noRecordItemsMessage: 'Nothing in record yet!',
      noAddToRecordMessage: "You don't have permission to add to this record.",
      startCallMessage: `Calling your personal phone at ${this.get('personalPhoneNumber')}`,
      addNoteInPastMessage: "Choose your note's place"
    };
  },
  classNames: 'care-record',

  // Internal properties
  // -------------------

  _recordClustersScroll: null, // set by `doRegister` in `infinite-scroll`

  _hasPersonalPhoneNumber: computed.notEmpty('personalPhoneNumber'),
  _hasItemsInRecord: computed.notEmpty('recordClusters'),

  _isAddingNoteInPast: false,
  _hasStartedCall: false,

  // Internal handlers
  // -----------------

  // note-specific handlers
  _onEditNote() {
    tryInvoke(this, 'onEditNote', [...arguments]);
  },
  _onRestoreNote() {
    tryInvoke(this, 'onRestoreNote', [...arguments]);
  },
  _onViewNoteHistory() {
    tryInvoke(this, 'onViewNoteHistory', [...arguments]);
  },

  // record display handlers
  _onLoadRecordItems() {
    tryInvoke(this, 'onLoadRecordItems', [...arguments]);
  },
  _onRefreshRecordItems() {
    tryInvoke(this, 'onRefreshRecordItems', [...arguments]);
  },
  _onViewScheduledMessages() {
    tryInvoke(this, 'onViewScheduledMessages', [...arguments]);
  },

  // content-related handlers
  _onContentChange() {
    tryInvoke(this, 'onContentChange', [...arguments]); // debounced in `compose-text`
  },
  _onAddImage() {
    tryInvoke(this, 'onAddImage', [...arguments]);
  },
  _onRemoveImage() {
    tryInvoke(this, 'onRemoveImage', [...arguments]);
  },

  // record modification handlers
  _addNoteInPast(addAfterRecordItem) {
    tryInvoke(this, 'onAddNote', [addAfterRecordItem]);
  },
  _addNoteNow() {
    tryInvoke(this, 'onAddNote', [...arguments]);
  },
  _onCall() {
    this.set('_hasStartedCall', true);
    this._tryResetScroll();
    tryInvoke(this, 'onCall', [...arguments]);
  },
  _onText() {
    this._tryResetScroll();
    tryInvoke(this, 'onText', [...arguments]);
  },
  _onScheduleMessage() {
    tryInvoke(this, 'onScheduleMessage', [...arguments]);
  },

  _tryResetScroll() {
    const scrollEl = this.get('_recordClustersScroll');
    if (scrollEl && scrollEl.actions) {
      tryInvoke(scrollEl.actions, 'resetPosition');
    }
  }
});
