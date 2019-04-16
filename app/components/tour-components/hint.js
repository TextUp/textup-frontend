import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';
import * as HintUtil from 'textup-frontend/utils/hint-info';

const { computed } = Ember;

export default Ember.Component.extend({
  tutorialService: Ember.inject.service(),

  propTypes: {
    hintId: PropTypes.string.isRequired
  },

  classNames: ['hint'],

  hintTitle: computed('hintId', function() {
    const hintId = this.get('hintId');
    return HintUtil.getTitle(hintId);
  }),
  hintText: computed('hintId', function() {
    const hintId = this.get('hintId');
    return HintUtil.getMessage(hintId);
  })
});
