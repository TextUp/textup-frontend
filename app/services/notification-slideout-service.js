import Constants from 'textup-frontend/constants';
import OwnerPolicyUtils from 'textup-frontend/utils/owner-policy';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly, or, not } from '@ember/object/computed';

export const ERROR_VOICEMAIL_RECORDING_MISSING_INFO =
  'Must provide all required information to add audio';
export const ERROR_VOICEMAIL_CALL_MISSING_PERSONAL_NUMBER =
  'You must have a personal number on file for TextUp to call you to record a voicemail greeting';

export default Service.extend({
  authService: service(),
  dataService: service(),
  slideoutService: service(),
  stateService: service(),
  store: service(),
  tutorialService: service(),

  // Properties
  // ----------

  isPhoneOwnerATeam: readOnly('stateService.ownerIsTeam'),
  phoneOwnerName: readOnly('_activePhoneOwner.name'),
  activePhone: readOnly('_activePhoneOwner.phone.content'),
  awayMessageSuffix: readOnly('_activePhoneOwner.org.content.awayMessageSuffix'),
  selfPolicy: computed('activePhone', 'authService.authUser', function() {
    return OwnerPolicyUtils.getSelf(this.get('activePhone'), this.get('authService.authUser'));
  }),
  otherPolicies: computed('activePhone', 'authService.authUser', function() {
    return OwnerPolicyUtils.getOthers(this.get('activePhone'), this.get('authService.authUser'));
  }),
  shouldShowFooter: or('_activePhoneOwner.isDirty', 'authService.authUser.isDirty'),
  shouldDisablePrimaryAction: or(
    '_activePhoneOwner.validations.isInvalid',
    'authService.authUser.validations.isInvalid'
  ),
  shouldForceKeepOpen: or(
    '_activePhoneOwner.{isSaving,isDirty}',
    'authService.authUser.{isSaving,isDirty}'
  ),
  isMissingPersonalNumber: not('authService.authUser.hasPersonalNumber'),
  shouldDisableVoicemailGreetingCall: or('shouldDisablePrimaryAction', 'isMissingPersonalNumber'),

  // Methods
  // -------

  openSlideout() {
    this.get('slideoutService').toggleSlideout(
      'slideouts/notifications',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    const phoneOwner = this.get('_activePhoneOwner'),
      authUser = this.get('authService.authUser');
    if (phoneOwner) {
      phoneOwner.rollbackAttributes();
    }
    if (authUser) {
      authUser.rollbackAttributes();
    }
    this.get('tutorialService').startCompleteTask(Constants.TASK.AVAILABILITY);
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('dataService')
      .persist([this.get('_activePhoneOwner'), this.get('authService.authUser')])
      .then(() => this.cancelSlideout());
  },

  onFinishRecordingGreeting(mimeType, data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!mimeType || !data) {
        reject(ERROR_VOICEMAIL_RECORDING_MISSING_INFO);
      }
      const phone = this.get('activePhone');
      phone.get('media').then(foundMedia => {
        // so we're not also sending all of the prior attempts too
        if (foundMedia) {
          foundMedia.rollbackAttributes();
        }
        const media = foundMedia || this.get('store').createRecord('media');
        media.addAudio(mimeType, data);
        phone.setProperties({ media });
        resolve();
      }, reject);
    });
  },
  onRequestVoicemailGreetingCall() {
    return new RSVP.Promise((resolve, reject) => {
      const numToCall = this.get('authService.authUser.personalNumber');
      if (!numToCall) {
        return reject(ERROR_VOICEMAIL_CALL_MISSING_PERSONAL_NUMBER);
      }
      this.get('activePhone').set('requestVoicemailGreetingCall', numToCall);
      this.get('dataService')
        .persist(this.get('_activePhoneOwner'))
        .then(resolve, reject);
    });
  },

  // Internal
  // --------

  _activePhoneOwner: readOnly('stateService.owner'),
});
