import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordItem from 'textup-frontend/models/record-item';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    item: PropTypes.instanceOf(RecordItem).isRequired,
    callOptions: PropTypes.object,
    noteOptions: PropTypes.object,
  },
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
  _isInternal: computed.equal('item.constructor.modelName', 'record-note'),
});
