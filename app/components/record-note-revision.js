import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNoteRevision from 'textup-frontend/models/record-note-revision';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    revision: PropTypes.instanceOf(RecordNoteRevision).isRequired
  },
  classNames: 'record-note-revision'
});
