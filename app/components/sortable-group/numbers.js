import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { tryInvoke, isPresent, isBlank } from '@ember/utils';
import ArrayUtils from 'textup-frontend/utils/array';
import ContactNumberObject from 'textup-frontend/objects/contact-number-object';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import SupportsValidation from 'textup-frontend/mixins/component/supports-validation';

export default Component.extend(PropTypesMixin, SupportsValidation, {
  propTypes: {
    numbers: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.arrayOf(PropTypes.instanceOf(ContactNumberObject)),
    ]),
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
    onAdded: PropTypes.func,
    onRemoved: PropTypes.func,
  },
  getDefaultProps() {
    return { numbers: [], readonly: false };
  },

  classNames: 'sortable-group-numbers',

  // Internal properties
  // -------------------

  _isReordering: false,
  _numbers: computed('numbers.[]', function() {
    return ArrayUtils.ensureArrayAndAllDefined(this.get('numbers')).map(({ number }) =>
      ContactNumberObject.create({ number })
    );
  }),
  _newNumberString: '',
  _hasNumbers: notEmpty('numbers'),
  // for `SupportsValidation` mixin
  $validateFields: 'input',
  $errorNeighbor: computed(function() {
    return this.$('.existing-numbers');
  }),

  // Internal handlers
  // -----------------

  _onAdd(number, isValid) {
    if (isValid && isPresent(number)) {
      const numToAdd = ContactNumberObject.create({ number }),
        newNumbers = [...this.get('numbers'), numToAdd];
      // passed in copied array with new state
      tryInvoke(this, 'onChange', [newNumbers]);
      // notify after this data has had a chance to propagate back down
      run.scheduleOnce('afterRender', () => {
        tryInvoke(this, 'onAdded', [numToAdd]);
        this.doValidate();
        this.set('_newNumberString', '');
      });
    }
  },

  _onRemove(index) {
    const nums = this.get('numbers'),
      numToRemove = nums.objectAt(index),
      newNumbers = [...nums];
    // passed in copied array with new state
    newNumbers.removeAt(index);
    tryInvoke(this, 'onChange', [newNumbers]);
    // notify after this data has had a chance to propagate back down
    run.scheduleOnce('afterRender', () => {
      tryInvoke(this, 'onRemoved', [numToRemove]);
      this.doValidate();
    });
  },

  _onReorder(itemModels) {
    tryInvoke(this, 'onChange', [itemModels]);
  },
  _onUpdateExisting(index, number) {
    // Short circuit if reordering so that we do not try to trigger a replacement of all the
    // current number objects while we are trying to update the order, not the value. This
    // handler is called even when reordering because we've bound `onFocusLeave`
    if (!this.get('_isReordering')) {
      if (isBlank(number)) {
        this._onRemove(index);
      } else {
        const newNumbers = [...this.get('numbers')];
        newNumbers.replace(index, 1, [ContactNumberObject.create({ number })]);
        tryInvoke(this, 'onChange', [newNumbers]);
      }
    }
  },
});
