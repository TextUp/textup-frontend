import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isPresent, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    linkLabel: PropTypes.string,
    onClickLink: PropTypes.func,
  },

  classNames: 'slideout-pane__header flex',

  // Internal properties
  // -------------------

  _hasLink: computed('linkLabel', 'onClickLink', function() {
    return isPresent(this.get('linkLabel')) && isPresent(this.get('onClickLink'));
  }),

  // Internal handlers
  // -----------------

  _onClickLink() {
    tryInvoke(this, 'onClickLink', [...arguments]);
  },
});
