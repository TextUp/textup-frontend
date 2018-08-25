import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordItem from 'textup-frontend/models/record-item';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    item: PropTypes.instanceOf(RecordItem).isRequired
  },
  classNames: ['record-item__metadata'],

  // Internal properties
  // -------------------

  _timestamp: computed.readOnly('item.whenCreated'),
  _author: computed.readOnly('item.authorName')
});
