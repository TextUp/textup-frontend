import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';

const { computed, $, run } = Ember;

export default Ember.Component.extend(HasWormhole, PropTypesMixin, {
  propTypes: {
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    elementToHighlight: PropTypes.string,
    elementToOpenMobile: PropTypes.string,
    elementToHighlightMobile: PropTypes.string,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
    isLastStep: PropTypes.bool.isRequired,
    isFirstStep: PropTypes.bool.isRequired
  },

  classNames: ['tour-step'],

  didRender() {
    this._super(...arguments);
    const elementName = this.get('elementToHighlightMobile');
    if (elementName) {
      const elementToScrollTo = $(elementName)[0];
      if (elementToScrollTo) {
        run.scheduleOnce('afterRender', () => {
          this.get('_mobileOverlay').actions.removeCutout();
          elementToScrollTo.scrollIntoView({ behavior: 'smooth' });
          run.later(() => this.get('_mobileOverlay').actions.calculateCutout(), 1000);
        });
      }
    }
    run.scheduleOnce('afterRender', () => this.get('_desktopOverlay').actions.calculateCutout());
  },
  didInsertElement() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', () => {
      Ember.$(Ember.getOwner(this).rootElement).addClass(this.get('_bodyDrawerClass'));
    });
  },
  willDestroyElement() {
    this._super(...arguments);
    Ember.$(Ember.getOwner(this).rootElement).removeClass(this.get('_bodyDrawerClass'));
  },

  _mobileOverlay: null,
  _desktopOverlay: null,
  _bodyDrawerClass: 'tour-step__root',

  // Internal properties
  // -----------------
  _elementToWormhole: computed('_containerId', function() {
    // return this.$(`${this.get('_containerId')}`);
    return this.$('.tour-step__wormhole');
  }),

  _isMobile: computed('', function() {
    return $(window).innerWidth() < 480;
  }),

  _containerId: computed('elementToHighlight', function() {
    return `${this.get('elementToHighlight')}__container`;
  })
});
