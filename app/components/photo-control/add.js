import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { extractImagesFromEvent } from 'textup-frontend/utils/photo';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onAdd: PropTypes.func.isRequired
  },
  classNames: ['photo-control__add'],

  didInsertElement() {
    this._super(...arguments);
    this.get('_$input').on(this.get('_changeEventName'), () => this._handleChange());
  },
  willDestroyElement() {
    this._super(...arguments);
    this.get('_$input').off(this.get('_changeEventName'));
  },

  // Internal properties
  // -------------------

  _isLoading: false,
  _isLoadError: false,
  _callId: 0,
  _changeEventName: computed('elementId', function() {
    return `change.${this.elementId}`;
  }),
  _$input: computed(function() {
    return this.$('input');
  }),

  // Internal handlers
  // -----------------

  _handleChange(event) {
    this.incrementProperty('_callId');
    const thisCallId = this.get('_callId');
    this._setLoadStartProps();
    extractImagesFromEvent(event).then(
      success => this._onSuccess(thisCallId, success),
      () => this._onFailure(thisCallId)
    );
  },
  _setLoadStartProps() {
    this.setProperties({ _isLoading: true, _isLoadError: false });
  },
  _onSuccess(thisCallId, payload) {
    if (thisCallId === this.get('_callId')) {
      this.setProperties({ _isLoading: false, _isLoadError: false });
      tryInvoke(this, 'onAdd', [payload]);
    }
  },
  _onFailure(thisCallId) {
    if (thisCallId === this.get('_callId')) {
      this.setProperties({ _isLoading: false, _isLoadError: true });
    }
  }
});
