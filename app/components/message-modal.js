import $ from 'jquery';
import Component from '@ember/component';
import moment from 'moment';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RSVP from 'rsvp';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { tryInvoke, typeOf } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  storageService: service(),

  propTypes: Object.freeze({
    url: PropTypes.string.isRequired,
    display: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    onClose: PropTypes.func,
  }),
  getDefaultProps() {
    return { display: false };
  },

  didReceiveAttrs() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, this._tryInit);
  },

  // Internal properties
  // -------------------

  _requestId: 1,
  _shouldShow: false,
  _isLoading: false,

  _lastViewedKey: alias('url'),
  _lastViewed: computed('url', function() {
    return moment(this.get('storageService').getItem(this.get('_lastViewedKey')));
  }),

  // Internal handlers
  // -----------------

  _onClose() {
    tryInvoke(this, 'onClose', arguments);
  },
  _onLoad() {
    this.set('_isLoading', false);
  },

  _tryInit() {
    const url = this.get('url');
    if (!url) {
      return;
    }
    const display = this.get('display');
    if (display === false) {
      this.set('_shouldShow', false);
    }
    if (display === true) {
      this._openModal();
    }
    if (typeOf(display) === 'number') {
      this._checkAndUpdateLastViewed().then(this._openModal.bind(this));
    }
  },

  _openModal() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this.setProperties({ _shouldShow: true, _isLoading: true });
  },

  _checkAndUpdateLastViewed() {
    return new RSVP.Promise((resolve, reject) => {
      this.incrementProperty('_requestId');
      const thisReqId = this.get('_requestId');
      $.get(this.get('url')).then(
        this._onLoadSuccess.bind(this, thisReqId, resolve),
        this._onLoadFailure.bind(this, thisReqId, reject)
      );
    });
  },
  _onLoadSuccess(thisReqId, resolve, data, textStatus, xhr) {
    if (this.isDestroying || this.isDestroyed || thisReqId !== this.get('_requestId')) {
      return;
    }
    const oldestAllowed = moment().subtract(this.get('display'), 'days'),
      lastViewed = this.get('_lastViewed'),
      timestamp = moment(xhr.getResponseHeader('last-modified'));
    // do not display if message is older than oldest allowed
    if (tryInvoke(timestamp, 'isBefore', [oldestAllowed])) {
      return;
    }
    // do not display if message is older than last viewed
    if (tryInvoke(lastViewed, 'isValid') && tryInvoke(timestamp, 'isBefore', [lastViewed])) {
      return;
    }
    // store when this url was displayed as an ISO string
    this.get('storageService').setItem(this.get('_lastViewedKey'), moment().toISOString());
    resolve();
  },
  _onLoadFailure(thisReqId, reject, xhr, textStatus, errorThrown) {
    if (this.isDestroying || this.isDestroyed || thisReqId !== this.get('_requestId')) {
      return;
    }
    debug('message-modal: could not retrieve message', errorThrown);
    reject();
  },
});
