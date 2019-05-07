import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import PlatformUtils from 'textup-frontend/utils/platform';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, run, tryInvoke } = Ember;

export const BODY_DRAWER_CLASS = 'tour-step__root';

export default Ember.Component.extend(PropTypesMixin, HasWormhole, HasAppRoot, {
  propTypes: {
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
    isLastStep: PropTypes.bool.isRequired,
    isFirstStep: PropTypes.bool.isRequired,
    elementToHighlight: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    elementToOpenMobile: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    elementToHighlightMobile: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
  },

  classNames: 'tour-step',

  didReceiveAttrs() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, this._setUpCutouts);
  },
  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => this.get('_root').addClass(BODY_DRAWER_CLASS));
  },
  willDestroyElement() {
    this._super(...arguments);
    this.get('_root').removeClass(BODY_DRAWER_CLASS);
  },

  // Internal properties
  // -------------------

  _isSettingUp: false,
  _mobileOverlay: null,
  _desktopOverlay: null,
  _elementToWormhole: computed(function() {
    return this.$('.tour-step__wormhole');
  }),

  // Internal handlers
  // -----------------

  _onNextOrFinish() {
    tryInvoke(this, this.get('isLastStep') ? 'onFinish' : 'onNext');
  },

  _setUpCutouts() {
    if (PlatformUtils.isMobile()) {
      this._clickAndScrollToAndCalculateCutout(
        this.get('elementToOpenMobile'),
        this.get('elementToHighlightMobile'),
        this.get('_mobileOverlay')
      );
    } else {
      this._tryCalculateCutout(this.get('_desktopOverlay'));
    }
  },
  _clickAndScrollToAndCalculateCutout(clickSelector, highlightSelector, overlay) {
    this._tryRemoveCutout(overlay);
    const $click = Ember.$(clickSelector);
    if ($click.length) {
      $click.click();
      run.later(this, this._scrollToAndCalculateCutout, highlightSelector, overlay, 500);
    } else {
      this._scrollToAndCalculateCutout(highlightSelector, overlay);
    }
  },
  _scrollToAndCalculateCutout(highlightSelector, overlay) {
    const scrollToEl = Ember.$(highlightSelector)[0];
    if (scrollToEl) {
      scrollToEl.scrollIntoView({ behavior: 'smooth' });
      // Need to hardcode a delay because `scrollIntoView` does not take a completion callback
      // or return a promise -- trying to find the scrollParent programmatically is too complicated
      run.later(this, this._tryCalculateCutout, overlay, 500);
    }
  },
  _tryRemoveCutout(overlay) {
    if (overlay) {
      overlay.actions.removeCutout();
    }
  },
  _tryCalculateCutout(overlay) {
    if (overlay) {
      overlay.actions.calculateCutout();
    }
  },
});
