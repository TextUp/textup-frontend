import Component from '@ember/component';
import HintUtils from 'textup-frontend/utils/hint-info';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(PropTypesMixin, {
  tutorialService: service(),

  propTypes: Object.freeze({
    hintId: PropTypes.string.isRequired,
  }),

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
