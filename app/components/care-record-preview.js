import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCluster from 'textup-frontend/objects/record-cluster';
import { notEmpty } from '@ember/object/computed';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    name: PropTypes.string,
    noItemsMessage: PropTypes.string,
    recordClusters: PropTypes.arrayOf(PropTypes.instanceOf(RecordCluster)),
    onOpen: PropTypes.func,
  }),
  getDefaultProps() {
    return { noItemsMessage: 'No messages received or sent.', recordClusters: [] };
  },

  classNames: 'care-record-preview',

  // Internal properties
  // -------------------

  _hasOnOpen: notEmpty('onOpen'),
});
