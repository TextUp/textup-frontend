import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    entityIdentifier: PropTypes.string.isRequired,
    linkTarget: PropTypes.string.isRequired,
    linkParams: PropTypes.array,
    bodyClass: PropTypes.string,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func,
  }),
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
