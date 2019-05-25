import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordItem from 'textup-frontend/models/record-item';
import TypeUtils from 'textup-frontend/utils/type';
import { computed } from '@ember/object';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    item: PropTypes.instanceOf(RecordItem).isRequired,
    callOptions: PropTypes.object,
    noteOptions: PropTypes.object,
  }),
  getDefaultProps() {
    return { noteOptions: {} };
  },

  classNames: ['record-cluster__item'],
  classNameBindings: [
    '_isOutgoing:record-cluster__item--outgoing',
    '_isIncoming:record-cluster__item--incoming',
    '_isInternal:record-cluster__item--internal',
  ],

  // Internal properties
  // -------------------

  _isOutgoing: computed('_isInternal', 'item.outgoing', function() {
    return !this.get('_isInternal') && this.get('item.outgoing');
  }),
  _isIncoming: computed('_isInternal', 'item.outgoing', function() {
    return !this.get('_isInternal') && !this.get('item.outgoing');
  }),
  _isInternal: computed('item', function() {
    return TypeUtils.isNote(this.get('item'));
  }),
});
