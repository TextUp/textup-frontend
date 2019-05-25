import Component from '@ember/component';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { and } from '@ember/object/computed';
import { computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { tryInvoke, typeOf } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onRevert: PropTypes.func,
    onValidate: PropTypes.func,
    onSave: PropTypes.func,

    showControls: PropTypes.any,
    isSelf: PropTypes.bool,
    closedLabel: PropTypes.string,
    openedLabel: PropTypes.string,
    selfLabel: PropTypes.string,
  }),
  getDefaultProps() {
    return { showControls: null, isSelf: false, closedLabel: 'Open', openedLabel: 'Cancel' };
  },

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  // Internal properties
  // -------------------

  _hideShow: null,
  _currentPassword: null,
  _publicAPI: computed(function() {
    return { boundProperty: null };
  }),
  _manualShouldShow: computed('showControls', function() {
    const showControls = this.get('showControls');
    return typeOf(showControls) === 'null' || typeOf(showControls) === 'undefined' || showControls;
  }),
  _shouldShowControls: and('_manualShouldShow', '_currentPassword', '_publicAPI.boundProperty'),

  // Internal handlers
  // -----------------

  _onHideShowOpen() {
    tryInvoke(this, 'onOpen');
  },
  _onHideShowClose() {
    this.setProperties({
      _currentPassword: null,
      '_publicAPI.boundProperty': null,
    });
    tryInvoke(this, 'onClose');
  },
  _onCancelAndClose() {
    tryInvoke(this, 'onRevert');
    this.get('_hideShow').actions.close();
  },
  _onValidateAndSaveAndClose() {
    const password = this.get('_currentPassword'),
      newValue = this.get('_publicAPI.boundProperty');
    return PropertyUtils.ensurePromise(tryInvoke(this, 'onValidate', [password]))
      .then(() => PropertyUtils.ensurePromise(tryInvoke(this, 'onSave', [newValue])))
      .then(() => this.get('_hideShow').actions.close());
  },
});
