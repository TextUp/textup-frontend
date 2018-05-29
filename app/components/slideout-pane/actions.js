import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doClose: PropTypes.func.isRequired,
    props: PropTypes.shape({
      showFooter: PropTypes.bool.isRequired,
      disablePrimary: PropTypes.bool,
      hideSecondary: PropTypes.bool,
      showDelete: PropTypes.bool,

      doPrimary: PropTypes.func.isRequired,
      primaryLabel: PropTypes.string.isRequired,
      primaryProgressLabel: PropTypes.string.isRequired,
      primaryClass: PropTypes.string,

      doSecondary: PropTypes.func,
      secondaryLabel: PropTypes.string,

      doMarkForDelete: PropTypes.func
    }).isRequired
  },

  classNames: 'slideout-pane__footer textup-container',
  classNameBindings: ['props.showFooter::slideout-pane__footer--hidden']
});
