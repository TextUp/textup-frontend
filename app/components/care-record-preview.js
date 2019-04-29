import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    name: PropTypes.string,
    noItemsMessage: PropTypes.string,
    recordClusters: PropTypes.arrayOf(PropTypes.instanceOf(RecordCluster)),
    onOpen: PropTypes.func,
  },
  getDefaultProps() {
    return { noItemsMessage: 'No messages received or sent.', recordClusters: [] };
  },

  classNames: 'care-record-preview',

  // Internal properties
  // -------------------

  _hasOnOpen: computed.notEmpty('onOpen'),

  // Internal handlers
  // -----------------

  _onOpen() {
    tryInvoke(this, 'onOpen', [...arguments]);
  },
});
