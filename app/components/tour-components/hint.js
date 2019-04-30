import Ember from 'ember';
import HintUtils from 'textup-frontend/utils/hint-info';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  tutorialService: Ember.inject.service(),

  propTypes: {
    hintId: PropTypes.string.isRequired,
  },

  classNames: 'hint',

  // Internal properties
  // -------------------

  _hintTitle: computed('hintId', function() {
    return HintUtils.getTitle(this.get('hintId'));
  }),
  _hintText: computed('hintId', function() {
    return HintUtils.getMessage(this.get('hintId'));
  }),
});
