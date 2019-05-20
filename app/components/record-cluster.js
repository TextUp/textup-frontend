import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    cluster: PropTypes.instanceOf(RecordCluster).isRequired,
    callOptions: PropTypes.object,
    noteOptions: PropTypes.object,
  },
});
