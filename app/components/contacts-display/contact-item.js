import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { ContactObject } from 'textup-frontend/objects/contact-object';
import { join, scheduleOnce } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    data: PropTypes.instanceOf(ContactObject),
  }),

  classNames: 'contacts_display__contact_item',

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('_publicAPI.data', this.get('data'));
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      isSelect: false,
      data: null,
      actions: {
        select: this._select.bind(this),
        deselect: this._deselect.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _onChange(event) {
    join(() => {
      this.set('_publicAPI.isSelect', event.target.checked);
    });
  },

  _select() {
    join(() => {
      this.set('_publicAPI.isSelect', true);
    });
  },

  _deselect() {
    join(() => {
      this.set('_publicAPI.isSelect', false);
    });
  },
});
