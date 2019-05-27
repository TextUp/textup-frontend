import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  dataService: service(),
  slideoutService: service(),
  teamService: service(),
  stateService: service(),

  // Properties
  // ----------

  existingTeams: readOnly('stateService.ownerAsOrg.existingTeams'),
  newTeam: null,
  teamListHideAway: null,
  shouldDisablePrimaryAction: readOnly('newTeam.validations.isInvalid'),
  shouldForceKeepOpen: readOnly('newTeam.isSaving'),
  noExistingTeams: empty('existingTeams'),
  slideoutTitle: computed('noExistingTeams', function() {
    return this.get('noExistingTeams') ? 'New Team' : 'Teams';
  }),

  // Methods
  // -------

  openNewTeamSlideout(org) {
    this.setProperties({
      newTeam: this.get('teamService').createNew(org),
      teamListHideAway: null,
      _org: org,
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/team/create',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  openTeamListSlideout(org) {
    this.setProperties({
      newTeam: null,
      teamListHideAway: null,
      _org: org,
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/team/list',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  onOpenCreateInTeamList() {
    this.set('newTeam', this.get('teamService').createNew(this.get('_org')));
  },

  cancelSlideout() {
    AppUtils.tryRollback(this.get('newTeam'));
    this.get('slideoutService').closeSlideout();
  },
  cancelCreateInTeamList() {
    AppUtils.tryRollback(this.get('newTeam'));
    PropertyUtils.tryInvoke(this.get('teamListHideAway'), 'actions.close');
  },

  finishNewTeamSlideout() {
    return this.get('teamService')
      .persistNew(this.get('newTeam'))
      .then(() => this.get('slideoutService').closeSlideout());
  },
  finishCreateInTeamList() {
    return this.get('teamService')
      .persistNew(this.get('newTeam'))
      .then(() => PropertyUtils.tryInvoke(this.get('teamListHideAway'), 'actions.close'));
  },

  // Internal
  // --------

  _org: null,
});
