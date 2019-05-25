import Service, { inject as service } from '@ember/service';
import StorageUtils from 'textup-frontend/utils/storage';
import { join, scheduleOnce } from '@ember/runloop';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  authService: service(),
  storageService: service(),

  // Properties
  // ----------

  isTourOngoing: readOnly('_tourManager.isOngoing'),

  // Methods
  // -------

  registerManagerAndTryStart(tourManager) {
    if (tourManager) {
      this.set('_tourManager', tourManager);
      if (this._shouldStartTour()) {
        join(() => scheduleOnce('afterRender', tourManager.actions.startTour));
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
