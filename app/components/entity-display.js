import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entityIdentifier: PropTypes.string.isRequired,
    linkTarget: PropTypes.string.isRequired,
    linkParams: PropTypes.array,
    bodyClass: PropTypes.string,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func,
  },
  getDefaultProps() {
    return { linkParams: [], bodyClass: '', isSelected: false };
  },

  classNames: 'entity-display',

  // Internal properties
  // -------------------

  _linkParams: computed('linkTarget', 'linkParams.[]', function() {
    return [this.get('linkTarget'), ...this.get('linkParams')];
  }),

  // Internal handlers
  // -----------------

  _onToggleSelect() {
    tryInvoke(this, 'onSelect', [...arguments]);
  },
});
