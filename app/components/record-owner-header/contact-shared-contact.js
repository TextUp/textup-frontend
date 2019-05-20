import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import Contact from 'textup-frontend/models/contact';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    contact: PropTypes.instanceOf(Contact).isRequired,
    backRouteName: PropTypes.string.isRequired,
    linkParams: PropTypes.array,
    onEdit: PropTypes.func,
    onEditSharing: PropTypes.func,
    onEditTagMembership: PropTypes.func,
    onExport: PropTypes.func,
    onStatusChange: PropTypes.func,
  },
  getDefaultProps() {
    return { linkParams: [] };
  },

  // Internal properties
  // -------------------

  _linkParams: computed('backRouteName', 'linkParams', function() {
    return [this.get('backRouteName'), ...this.get('linkParams')];
  }),

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
  _onExport() {
    tryInvoke(this, 'onExport', [...arguments]);
  },
  _onStatusChange() {
    tryInvoke(this, 'onStatusChange', [...arguments]);
  },
});
