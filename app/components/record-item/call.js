import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCall from 'textup-frontend/models/record-call';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    call: PropTypes.instanceOf(RecordCall).isRequired,
    onEndOngoing: PropTypes.func,
  },
  classNames: ['record-item', 'record-item--call'],

  // Internal handlers
  // -----------------

  _onEndOngoing() {
    tryInvoke(this, 'onEndOngoing', [...arguments]);
  },
});
