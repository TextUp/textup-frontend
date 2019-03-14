import Ember from 'ember';
import config from 'textup-frontend/config/environment';
import moment from 'moment';

const { computed, isPresent, tryInvoke } = Ember;

export default Ember.Component.extend({
  config,
  storage: Ember.inject.service(),

  didInsertElement() {
    this._super(...arguments);
    Ember.$.get(this.get('config.appMessage.messageEndpoint')).then(
      this._onMessageSuccess.bind(this),
      this._onMessageFailure.bind(this)
    );
  },

  // Internal properties
  // -------------------

  _oldestAllowed: computed('config.appMessage.oldestMessageInDays', function() {
    return moment().subtract(this.get('config.appMessage.oldestMessageInDays'), 'days');
  }),
  _lastViewedKey: computed.alias('config.appMessage.lastViewedStorageKey'),
  _lastViewed: computed('_lastViewedKey', function() {
    return moment(this.get('storage').getItem(this.get('_lastViewedKey')));
  }),

  _data: null,
  _message: computed('_data', function() {
    const data = this.get('_data');
    return isPresent(data) ? Ember.String.htmlSafe(data) : null;
  }),
  _shouldShow: computed.notEmpty('_message'),

  // Internal handlers
  // -----------------

  _onMessageSuccess(data, textStatus, xhr) {
    const oldestAllowed = this.get('_oldestAllowed'),
      lastViewed = this.get('_lastViewed'),
      timestamp = moment(xhr.getResponseHeader('last-modified'));
    if (!tryInvoke(timestamp, 'isAfter', [oldestAllowed])) {
      return;
    }
    if (tryInvoke(lastViewed, 'isValid') && !tryInvoke(timestamp, 'isAfter', [lastViewed])) {
      return;
    }
    this._updateViewed(timestamp, data);
  },
  _onMessageFailure(xhr, textStatus, errorThrown) {
    Ember.debug('app-message: could not retrieve message', errorThrown);
  },

  _updateViewed(timestamp, data) {
    this.get('storage').trySet(localStorage, this.get('_lastViewedKey'), timestamp.toISOString());
    this.set('_data', data);
  },
});
