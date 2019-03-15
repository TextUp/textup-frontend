import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';
import * as HintUtil from 'textup-frontend/utils/hint-info';

const { computed } = Ember;

export default Ember.Component.extend({
  // hintService: Ember.inject.service(),

  propTypes: {
    hintId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    verticalPosition: PropTypes.bool
  },
  getDefaultProps() {
    return {
      verticalPosition: false
    };
  },

  classNames: ['hint'],

  shouldShow: computed(function() {
    return true;
  }),

  dot: computed('type', function() {
    const type = this.get('type');
    return type === 'dot';
  }),

  focus: computed('type', function() {
    const type = this.get('type');
    return type === 'focus';
  }),

  hintTitle: computed('hintId', function() {
    const hintId = this.get('hintId');
    return HintUtil.getTitle(hintId);
  }),
  hintText: computed('hintId', function() {
    const hintId = this.get('hintId');
    return HintUtil.getMessage(hintId);
  }),

  focusIn() {
    if (!this.get('mobile')) {
      this.get('_popOver').actions.open();
    }
  },

  focusOut() {
    if (!this.get('mobile')) {
      this.get('_popOver').actions.close();
    }
  }

  // shouldShow: computed.alias("hintService.shouldShow"),
});
