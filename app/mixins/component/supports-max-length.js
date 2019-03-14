import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import {
  isOrContainsElement,
  buildElement,
  wrapElement,
  unwrapElement,
  insertElementsWithin,
  removeElement,
} from 'textup-frontend/utils/element';

const { assign, computed, run, typeOf } = Ember,
  DEFAULT_PERCENT_THRESHOLD = 90,
  NAMESPACE = 'supports-max-length',
  CONTAINER_CLASS = 'max-length',
  INDICATOR_CLASS = 'max-length__indicator',
  INDICATOR_OPEN_CLASS = 'max-length__indicator--visible',
  INDICATOR_POSITION_CLASS_ROOT = 'max-length__indicator--position';

export default Ember.Mixin.create(PropTypesMixin, HasEvents, {
  propTypes: {
    maxLength: PropTypes.oneOfType([PropTypes.null, PropTypes.number]),
    maxLengthPosition: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    // from 0 to 100 -- show the max length indicator when the current value length exceeds
    // this percent of the maximum allowed length. For example, if the max allowed length is 100
    // and the threshold is at 90, then we would show the indicator at length 90+ but not below 90
    showMaxLengthPercentThreshold: PropTypes.number,
    maxLengthContainerClass: PropTypes.string,
    maxLengthIndicatorClass: PropTypes.string,
  },
  getDefaultProps() {
    return assign(
      {
        showMaxLengthPercentThreshold: DEFAULT_PERCENT_THRESHOLD,
        maxLengthContainerClass: '',
        maxLengthIndicatorClass: '',
      },
      this._super(...arguments)
    );
  },
  attributeBindings: ['_maxLength:maxlength'],

  didInsertElement() {
    this._super(...arguments);
    // will throw error when component is rendered if this mandatory handler is not implemented
    run.scheduleOnce('afterRender', this, this._buildCurrentValueLength);
  },
  didReceiveAttrs() {
    this._super(...arguments);
    // check if we need to set up max length
    if (this.get('_hasMaxLength')) {
      run.scheduleOnce('afterRender', this, this._setupMaxLength);
    } else {
      run.scheduleOnce('afterRender', this, this._cleanupMaxLength);
    }
    // try to update indicator position if needed
    const position = this.get('maxLengthPosition');
    if (position !== this.get('_originalMaxLengthPosition')) {
      const indicatorEl = this.get('_maxLengthIndicator');
      run.scheduleOnce('afterRender', this, this._tryUpdateMaxLengthIndicatorPosition, indicatorEl);
      this.set('_originalMaxLengthPosition', position);
    }
  },
  willDestroyElement() {
    this._super(...arguments);
    this._cleanupMaxLength();
  },

  // Internal properties
  // -------------------

  _hasMaxLength: computed('maxLength', function() {
    return this.get('maxLength') > 0;
  }),
  _maxLength: computed('_hasMaxLength', 'maxLength', function() {
    return this.get('_hasMaxLength') && this.get('maxLength');
  }),
  _originalMaxLengthPosition: null,
  _maxLengthPositionToClassName: computed(function() {
    return {
      [Constants.MAX_LENGTH.POSITION.TOP]: `${INDICATOR_POSITION_CLASS_ROOT}-top`,
      [Constants.MAX_LENGTH.POSITION.BOTTOM]: `${INDICATOR_POSITION_CLASS_ROOT}-bottom`,
    };
  }),
  _maxLengthPositionClass: computed(
    '_maxLengthPositionToClassName',
    'maxLengthPosition',
    function() {
      const positionMap = this.get('_maxLengthPositionToClassName'),
        positionVal = this.get('maxLengthPosition') || Constants.MAX_LENGTH.POSITION.TOP;
      return positionMap[positionVal];
    }
  ),
  _showMaxLengthPercentThreshold: computed('showMaxLengthPercentThreshold', function() {
    const threshold = this.get('showMaxLengthPercentThreshold');
    return typeOf(threshold) === 'number'
      ? Math.min(Math.max(threshold, 0), 100)
      : DEFAULT_PERCENT_THRESHOLD;
  }),
  _maxLengthThresholdValue: computed('maxLength', '_showMaxLengthPercentThreshold', function() {
    return (this.get('maxLength') * this.get('_showMaxLengthPercentThreshold')) / 100;
  }),
  _maxLengthIndicator: null,

  // Internal handlers
  // -----------------

  _buildCurrentValueLength() {
    throw new Error(
      'Components that extend the `supports-max-length` mixin must implement the `_buildCurrentValueLength` handler'
    );
  },
  _setupMaxLength() {
    if (this.get('_maxLengthIndicator')) {
      return;
    }
    const thisEl = this.element,
      containerEl = buildElement('div', this.get('maxLengthContainerClass'), CONTAINER_CLASS),
      indicatorEl = buildElement('div', this.get('maxLengthIndicatorClass'), INDICATOR_CLASS);
    this._tryUpdateMaxLengthIndicatorPosition(indicatorEl);
    this._updateMaxLength(indicatorEl);
    // build + configure DOM
    wrapElement(containerEl, thisEl);
    insertElementsWithin(containerEl, indicatorEl);
    this._bindMaxLengthEvents(indicatorEl);
    // check if the component is already focused since. If so, show the indicator right away
    if (isOrContainsElement(thisEl, document.activeElement)) {
      this._tryShowMaxLengthIndicator(indicatorEl);
    } else {
      this._hideMaxLengthIndicator(indicatorEl);
    }
    this.setProperties({ _maxLengthIndicator: indicatorEl });
  },
  _cleanupMaxLength() {
    const indicatorEl = this.get('_maxLengthIndicator');
    if (!indicatorEl) {
      return;
    }
    unwrapElement(this.element);
    removeElement(indicatorEl);
    this._unbindMaxLengthEvents();
    this.setProperties({ _maxLengthIndicator: null });
  },

  _bindMaxLengthEvents(indicatorEl) {
    this.$()
      .on(this._event('keyup', NAMESPACE), this._updateMaxLength.bind(this, indicatorEl))
      .on(this._event('paste', NAMESPACE), this._updateMaxLengthAfterRender.bind(this, indicatorEl))
      .on(this._event('cut', NAMESPACE), this._updateMaxLengthAfterRender.bind(this, indicatorEl))
      .on(
        this._event('focusin', NAMESPACE),
        this._tryShowMaxLengthIndicator.bind(this, indicatorEl)
      )
      .on(this._event('focusout', NAMESPACE), this._hideMaxLengthIndicator.bind(this, indicatorEl));
  },
  _unbindMaxLengthEvents() {
    this.$().off(this._event('', NAMESPACE));
  },

  _tryShowMaxLengthIndicator(indicatorEl) {
    if (!indicatorEl || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    if (this._buildCurrentValueLength() >= this.get('_maxLengthThresholdValue')) {
      Ember.$(indicatorEl).addClass(INDICATOR_OPEN_CLASS);
    } else {
      // if we should not be showing the indicator, then ensure that it is hidden
      this._hideMaxLengthIndicator(indicatorEl);
    }
  },
  _hideMaxLengthIndicator(indicatorEl) {
    if (!indicatorEl || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    Ember.$(indicatorEl).removeClass(INDICATOR_OPEN_CLASS);
  },

  _tryUpdateMaxLengthIndicatorPosition(indicatorEl) {
    if (!indicatorEl) {
      return;
    }
    Ember.$(indicatorEl)
      .removeClass(Object.values(this.get('_maxLengthPositionToClassName')).join(' '))
      .addClass(this.get('_maxLengthPositionClass'));
  },
  _updateMaxLengthAfterRender(indicatorEl) {
    run.scheduleOnce('afterRender', this, this._updateMaxLength, indicatorEl);
  },
  _updateMaxLength(indicatorEl) {
    if (!indicatorEl || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    indicatorEl.textContent = `${this._buildCurrentValueLength()} / ${this.get('maxLength')}`;
    // every time we update the max length indicator, also check to see if we should show
    // or hide the indicator while we are in the process of typing
    this._tryShowMaxLengthIndicator(indicatorEl);
  },
});
