import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNoteRevision from 'textup-frontend/models/record-note-revision';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    revision: PropTypes.instanceOf(RecordNoteRevision).isRequired
  },
  classNames: 'record-note-revision'
});
