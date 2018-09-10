import Contact from 'textup-frontend/models/contact';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    contact: PropTypes.instanceOf(Contact).isRequired,
    backRouteName: PropTypes.string.isRequired,
    onEdit: PropTypes.func,
    onEditSharing: PropTypes.func,
    onEditTagMembership: PropTypes.func,
    onStatusChange: PropTypes.func
  },

  // Internal handlers
  // -----------------

  _onEdit() {
    tryInvoke(this, 'onEdit', [...arguments]);
  },
  _onEditSharing() {
    tryInvoke(this, 'onEditSharing', [...arguments]);
  },
  _onEditTagMembership() {
    tryInvoke(this, 'onEditTagMembership', [...arguments]);
  },
  _onStatusChange() {
    tryInvoke(this, 'onStatusChange', [...arguments]);
  }
});
