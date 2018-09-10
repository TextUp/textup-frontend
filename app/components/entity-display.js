import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entityIdentifier: PropTypes.string.isRequired,
    linkTarget: PropTypes.string.isRequired,
    linkParam: PropTypes.any,
    bodyClass: PropTypes.string,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func
  },
  getDefaultProps() {
    return { isSelected: false, bodyClass: '' };
  },

  classNames: 'entity-display',

  actions: {
    onToggleSelect() {
      Ember.tryInvoke(this, 'onSelect', [...arguments]);
    }
  }
});
