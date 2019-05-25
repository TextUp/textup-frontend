import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordText from 'textup-frontend/models/record-text';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    text: PropTypes.instanceOf(RecordText).isRequired,
  }),
  classNames: ['record-item', 'record-item--text'],
});
