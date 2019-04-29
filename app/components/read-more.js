import Ember from 'ember';
import MutationObserver from 'npm:mutation-observer';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    showText: PropTypes.string,
    hideText: PropTypes.string,
  },
  getDefaultProps() {
    return { showText: 'Show more', hideText: 'Show less' };
  },

  classNames: 'read-more',
  classNameBindings: ['_isOpen:read-more--open'],
  attributeBindings: ['_style:style'],

  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this._startObservingContents.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    this._stopObservingContents();
  },

  // Internal properties
  // -------------------

  _isOpen: false,
  _contentsHeight: null,
  _style: computed('_isOpen', '_contentsHeight', function() {
    const isOpen = this.get('_isOpen'),
      contentsHeight = this.get('_contentsHeight');
    return isOpen && contentsHeight
      ? new Ember.String.htmlSafe(`max-height: ${contentsHeight}px;`)
      : null;
  }),

  _shouldShowControl: computed('_contentsHeight', function() {
    const contentsHeight = this.get('_contentsHeight'),
      $el = this.$();
    return contentsHeight && $el ? contentsHeight > $el.outerHeight() : false;
  }),
  _$contents: computed(function() {
    return this.$('.read-more__contents');
  }),
  _observer: null,

  // Internal handlers
  // -----------------

  _toggleOpen() {
    this.toggleProperty('_isOpen');
  },

  _startObservingContents() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const $contents = this.get('_$contents'),
      observer = new MutationObserver(this._updateContentsHeight.bind(this));
    observer.observe($contents[0], { characterData: true, childList: true, subtree: true });
    this.set('_observer', observer);
    this._updateContentsHeight();
  },
  _stopObservingContents() {
    const observer = this.get('_observer');
    if (observer) {
      observer.disconnect();
    }
  },

  _updateContentsHeight() {
    run.throttle(
      () => this.setProperties({ _contentsHeight: this.get('_$contents').outerHeight() }),
      1000
    );
  },
});
