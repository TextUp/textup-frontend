import Ember from 'ember';
import ManagesCareRecord from 'textup-frontend/mixins/route/manages-care-record';
import ManagesExistingTag from 'textup-frontend/mixins/route/manages-existing-tag';
import ManagesFutureMessages from 'textup-frontend/mixins/route/manages-future-messages';
import ManagesMediaOwner from 'textup-frontend/mixins/route/manages-media-owner';
import ManagesRecordNotes from 'textup-frontend/mixins/route/manages-record-notes';

export default Ember.Route.extend(
  ManagesCareRecord,
  ManagesExistingTag,
  ManagesFutureMessages,
  ManagesMediaOwner,
  ManagesRecordNotes
);
