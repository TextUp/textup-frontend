import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCall from 'textup-frontend/models/record-call';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    call: PropTypes.instanceOf(RecordCall).isRequired,
    onEndOngoing: PropTypes.func,
  }),
  classNames: ['record-item', 'record-item--call'],

  // Internal handlers
  // -----------------

  _onEndOngoing() {
    tryInvoke(this, 'onEndOngoing', [...arguments]);
  },
});
