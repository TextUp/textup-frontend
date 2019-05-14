import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
const { computed } = Ember;

// TODO: write tests for this

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    numSaved: PropTypes.number,
    numTotal: PropTypes.number,
    isSaving: PropTypes.bool,
  },

  classNames: ['contacts-load'],
  classNameBindings: ['isSaving:contacts-load:contacts-load--hidden'],

  _progressWidth: computed('numSaved', 'numTotal', function() {
    let widthVal = (this.get('numSaved') / this.get('numTotal')) * 100;
    return Ember.String.htmlSafe(`width: ${widthVal}%;`);
  }),
});
