import Ember from 'ember';
import StorageUtils from 'textup-frontend/utils/storage';

const { computed, run } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  storageService: Ember.inject.service(),

  // Properties
  // ----------

  isTourOngoing: computed.readOnly('_tourManager.isOngoing'),

  // Methods
  // -------

  registerManagerAndTryStart(tourManager) {
    if (tourManager) {
      this.set('_tourManager', tourManager);
      if (this._shouldStartTour()) {
        run.join(() => run.scheduleOnce('afterRender', tourManager.actions.startTour));
      }
    }
  },
  onTourFinish() {
    this.get('storageService').setItem(
      StorageUtils.tourKey(this.get('authService.authUser')),
      StorageUtils.TRUE
    );
  },

  // Internal
  // --------

  _tourManager: null,

  _shouldStartTour() {
    const finishedTour = this.get('storageService').getItem(
      StorageUtils.tourKey(this.get('authService.authUser'))
    );
    return finishedTour !== StorageUtils.TRUE;
  },
});
