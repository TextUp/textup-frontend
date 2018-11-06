import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import MediaElement from 'textup-frontend/models/media-element';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    audio: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaElement))
    ]),
    maxNumToDisplay: PropTypes.number,
    sortPropName: PropTypes.string
  },
  getDefaultProps() {
    return { audio: [] };
  },

  // Internal properties
  // -------------------

  _audio: computed.filterBy('audio', 'isAudio', true),
  _sortedAudio: computed('_audio.[]', 'sortPropName', function() {
    const audio = this.get('_audio');
    if (audio) {
      const sortName = this.get('sortPropName');
      return sortName ? audio.sortBy(sortName) : audio;
    }
  }),
  _displayedAudio: computed('_sortedAudio.[]', 'maxNumToDisplay', function() {
    const audio = this.get('_sortedAudio');
    if (audio) {
      const numAudio = audio.get('length'),
        maxNum = this.get('maxNumToDisplay');
      return (maxNum <= numAudio) & (maxNum >= 0) ? audio.slice(0, maxNum) : audio;
    }
  })
});
