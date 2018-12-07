import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Tag from 'textup-frontend/models/tag';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    tag: PropTypes.instanceOf(Tag).isRequired,
    backRouteName: PropTypes.string.isRequired,
    onEdit: PropTypes.func,
    onExport: PropTypes.func
  },

  // Internal handlers
  // -----------------

  _onEdit() {
    tryInvoke(this, 'onEdit', [...arguments]);
  },
  _onExport() {
    tryInvoke(this, 'onExport', [...arguments]);
  }
});
