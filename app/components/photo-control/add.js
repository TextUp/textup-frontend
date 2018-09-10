import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { extractImagesFromEvent } from 'textup-frontend/utils/photo';

const { computed, get, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onAdd: PropTypes.func.isRequired,
    labelClass: PropTypes.string
  },
  classNames: ['photo-control__add'],

  // Internal properties
  // -------------------

  _isLoading: false,
  _isLoadError: false,
  _callId: 0,
  _$input: computed(function() {
    return this.$('input');
  }),

  // Internal handlers
  // -----------------

  _handleChange(event) {
    // short circuit without resulting in error state if no files attached
    if (!get(event.target.files, 'length')) {
      this._finishAdd(true);
      return;
    }
    this.incrementProperty('_callId');
    const thisCallId = this.get('_callId');
    this._startAdd();
    extractImagesFromEvent(event).then(
      success => this._onSuccess(thisCallId, success),
      () => this._onFailure(thisCallId)
    );
  },
  _onSuccess(thisCallId, payload) {
    if (thisCallId === this.get('_callId')) {
      this._finishAdd(true);
      tryInvoke(this, 'onAdd', [payload]);
    }
  },
  _onFailure(thisCallId) {
    if (thisCallId === this.get('_callId')) {
      this._finishAdd(false);
    }
  },

  _startAdd() {
    this.setProperties({ _isLoading: true, _isLoadError: false });
  },
  _finishAdd(isSuccess) {
    const $input = this.get('_$input');
    if ($input.length) {
      $input[0].value = null;
    }
    this.setProperties({ _isLoading: false, _isLoadError: !isSuccess });
  }
});
