import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCall from 'textup-frontend/models/record-call';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    call: PropTypes.instanceOf(RecordCall).isRequired,
    onEndOngoing: PropTypes.func,
  }),
  classNames: ['record-item', 'record-item--call'],
});
