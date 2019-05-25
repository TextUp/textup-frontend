import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    entity: PropTypes.EmberObject,
  }),

  tagName: 'span',
  classNames: 'horizontal-items',
});
