import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  dataService: service(),
  store: service(),

  createNew(org) {
    return this.get('store').createRecord(Constants.MODEL.TEAM, {
      org,
      location: this.get('store').createRecord(Constants.MODEL.LOCATION, {
        address: org.get('location.address'),
        lat: org.get('location.lat'),
        lng: org.get('location.lng'),
      }),
    });
  },
  persistNew(newTeam) {
    return this.get('dataService').persist(newTeam);
    // TODO why is unshifting the team needed?
    // .then(() => {
    //   // there's a zombie location record that persists, but we
    //   // are leaving it in the store because unloading the zombie
    //   // location also disassociates the team and its location
    //   const model = this.get('currentModel');
    //   model.get('teams').then(teams => teams.unshiftObject(persistedTeam));
    //   PropertyUtils.callIfPresent(then);
    // });
  },
});
