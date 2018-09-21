import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordItem from 'textup-frontend/models/record-item';
import { pluralize } from 'textup-frontend/utils/text';

const { computed, isArray, isEmpty, typeOf } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    item: PropTypes.instanceOf(RecordItem).isRequired,
    disabled: PropTypes.bool
  },
  getDefaultProps() {
    return { disabled: false };
  },
  classNames: ['record-item__receipts'],
  classNameBindings: [
    'disabled:record-item__receipts--disabled',
    '_hasReceipts::record-item__receipts--disabled'
  ],

  // Internal properties
  // -------------------

  _hasReceipts: computed('item.receipts.{failed,busy,pending,success}.[]', function() {
    const receipts = this.get('item.receipts');
    return (
      typeOf(receipts) === 'object' &&
      ((isArray(receipts.failed) && !isEmpty(receipts.failed)) ||
        (isArray(receipts.busy) && !isEmpty(receipts.busy)) ||
        (isArray(receipts.pending) && !isEmpty(receipts.pending)) ||
        (isArray(receipts.success) && !isEmpty(receipts.success)))
    );
  }),
  _triggerText: computed(
    '_hasReceipts',
    'item.receipts.{failed,busy,pending,success}.[]',
    function() {
      if (!this.get('_hasReceipts')) {
        return '';
      }
      const receipts = this.get('item.receipts');
      if (receipts.success) {
        const numSuccess = receipts.success.length;
        return `${numSuccess} ${pluralize('recipient', numSuccess)}`;
      } else if (receipts.pending) {
        return `${receipts.pending.length} pending`;
      } else if (receipts.busy) {
        return `${receipts.busy.length} busy`;
      } else if (receipts.failed) {
        return `${receipts.failed.length} failed`;
      } else {
        return '';
      }
    }
  ),
  _showDetails: false,

  // Internal handlers
  // -----------------

  _toggleDetails() {
    if (!this.get('_showDetails') && !this.get('disabled') && this.get('_hasReceipts')) {
      this.set('_showDetails', true);
    } else {
      this.set('_showDetails', false);
    }
  }
});
