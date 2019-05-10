import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { ContactObject } from 'textup-frontend/objects/contact-object';

const { tryInvoke, computed, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func,
    onChange: PropTypes.func,
    data: PropTypes.instanceOf(ContactObject),
  },

  classNames: 'contacts-display__contact_item',

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
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
    run.join(() => {
      this.set('_publicAPI.isSelect', event.target.checked);
      tryInvoke(this, 'onChange');
    });
  },

  _select() {
    run.join(() => {
      this.set('_publicAPI.isSelect', true);
      tryInvoke(this, 'onChange');
    });
  },

  _deselect() {
    run.join(() => {
      this.set('_publicAPI.isSelect', false);
      tryInvoke(this, 'onChange');
    });
  },
});
