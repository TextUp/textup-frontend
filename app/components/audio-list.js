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
    itemClass: PropTypes.string,
    maxNumToDisplay: PropTypes.number,
    sortPropName: PropTypes.string,
    sortLowToHigh: PropTypes.bool
  },
  getDefaultProps() {
    return { audio: [], itemClass: '', sortLowToHigh: true };
  },

  // Internal properties
  // -------------------

  _audio: computed.filterBy('audio', 'isAudio', true),
  _sortedAudio: computed('_audio.[]', 'sortPropName', 'sortLowToHigh', function() {
    const audio = this.get('_audio');
    if (audio) {
      const sortName = this.get('sortPropName');
      if (sortName) {
        const audio2 = audio.sortBy(sortName),
          sortedAudio = this.get('sortLowToHigh') ? audio2 : audio2.reverseObjects();
        // Sort order is not reflected unless we keep this call to map by. Not sure why...
        sortedAudio.mapBy(sortName);
        return sortedAudio;
      } else {
        return audio;
      }
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
