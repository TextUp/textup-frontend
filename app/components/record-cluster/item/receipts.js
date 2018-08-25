import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordItem from 'textup-frontend/models/record-item';
import { pluralize } from 'textup-frontend/utils/text';

const { computed, isArray, typeOf } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    item: PropTypes.instanceOf(RecordItem).isRequired
  },
  classNames: ['record-item__receipts'],

  // Internal properties
  // -------------------

  _triggerId: computed('elementId', function() {
    return `${this.get('elementId')}--trigger`;
  }),
  _triggerIdSelector: computed('_triggerId', function() {
    return `#${this.get('_triggerId')}`;
  }),
  _hasReceipts: computed('item.receipts.{failed,busy,pending,success}.[]', function() {
    const receipts = this.get('item.receipts');
    return (
      typeOf(receipts) === 'object' &&
      (isArray(receipts.failed) ||
        isArray(receipts.busy) ||
        isArray(receipts.pending) ||
        isArray(receipts.success))
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
        return `${numSuccess} ${pluralize('success', numSuccess)}`;
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
  )
});
