import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

export default Component.extend(PropTypesMixin, {
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

  _hasOnOpen: notEmpty('onOpen'),

  // Internal handlers
  // -----------------

  _onOpen() {
    tryInvoke(this, 'onOpen', [...arguments]);
  },
});
