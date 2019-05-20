import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Tag from 'textup-frontend/models/tag';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    tag: PropTypes.instanceOf(Tag).isRequired,
    backRouteName: PropTypes.string.isRequired,
    linkParams: PropTypes.array,
    onEdit: PropTypes.func,
    onExport: PropTypes.func,
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
  _onExport() {
    tryInvoke(this, 'onExport', [...arguments]);
  },
});
