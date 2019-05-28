import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    onClose: PropTypes.func.isRequired,
    showFooter: PropTypes.bool,

    onPrimary: PropTypes.func.isRequired,
    disablePrimary: PropTypes.bool,
    primaryLabel: PropTypes.string.isRequired,
    primaryClass: PropTypes.string,

    onSecondary: PropTypes.func,
    hideSecondary: PropTypes.bool,
    secondaryLabel: PropTypes.string,

    onMarkForDelete: PropTypes.func,
    showDelete: PropTypes.bool,
  }),
  getDefaultProps() {
    return {
      showFooter: false,
      primaryClass: '',
      primaryLabel: 'Save',
      disablePrimary: false,
      hideSecondary: false,
      secondaryLabel: 'Cancel',
      showDelete: false,
    };
  },

  classNames: 'slideout-pane__footer flex flex--spacing-between',
  classNameBindings: 'showFooter::slideout-pane__footer--hidden',
});
