import Component from '@ember/component';
import Contact from 'textup-frontend/models/contact';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    contact: PropTypes.instanceOf(Contact).isRequired,
    backRouteName: PropTypes.string.isRequired,
    linkParams: PropTypes.array,
    onEdit: PropTypes.func,
    onEditSharing: PropTypes.func,
    onEditTagMembership: PropTypes.func,
    onExport: PropTypes.func,
    onStatusChange: PropTypes.func,
  }),
  getDefaultProps() {
    return { linkParams: [] };
  },

  // Internal properties
  // -------------------

  _linkParams: computed('backRouteName', 'linkParams', function() {
    return [this.get('backRouteName'), ...this.get('linkParams')];
  }),
});
