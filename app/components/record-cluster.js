import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    cluster: PropTypes.instanceOf(RecordCluster).isRequired,
    callOptions: PropTypes.object,
    noteOptions: PropTypes.object,
  },
});
