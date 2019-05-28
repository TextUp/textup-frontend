import $ from 'jquery';
import ArrayUtils from 'textup-frontend/utils/array';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import humanId from 'human-id';
import Service, { inject as service } from '@ember/service';

export const SUCCESS_MSG = 'Almost done creating your account...';
export const COMPLETE_MSG_PREFIX = 'Success! Welcome ';

export default Service.extend({
  authService: service(),
  dataService: service(),
  notifications: service('notification-messages-service'),
  requestService: service(),
  router: service(),
  staffListService: service(),
  store: service(),

  // Methods
  // -------

  createNew(org) {
    return this.get('store').createRecord(Constants.MODEL.STAFF, {
      org,
      status: Constants.STAFF.STATUS.STAFF,
      password: humanId({ separator: '-', capitalize: false }),
    });
  },

  updateLockCode(staff, newVal) {
    staff.set('lockCode', newVal);
    return this.get('dataService').persist(staff);
  },
  updatePassword(staff, newVal) {
    staff.set('password', newVal);
    return this._persistAndLogOutIfSelf(staff);
  },
  updateUsername(staff, newVal) {
    staff.set('username', newVal);
    return this._persistAndLogOutIfSelf(staff);
  },
  updateStatus(staffs, newStatus) {
    const toBeSaved = ArrayUtils.ensureArrayAndAllDefined(staffs).filterBy('isAuthUser', false);
    toBeSaved.forEach(staff => staff.set('status', newStatus));
    return this.get('dataService')
      .persist(toBeSaved)
      .then(() => toBeSaved.forEach(staff => staff.set('isSelected', false)));
  },
  persistNewAndLogIn(newStaff, organization) {
    // ensure that new staff is created under specified org
    newStaff.set('org', organization);
    // then attempt to create staff and log in
    return this.get('requestService')
      .handleIfError(
        $.ajax({
          type: Constants.REQUEST_METHOD.POST,
          url: `${config.host}/v1/public/staff`,
          contentType: Constants.MIME_TYPE.JSON,
          data: JSON.stringify(newStaff.serialize({ includeId: false })),
        })
      )
      .then(result => this._logInAfterCreate(result.staff, newStaff.get('password')));
  },
  persistNew(newStaff) {
    return this.get('dataService')
      .persist(newStaff)
      .then(() => this.get('staffListService').tryAddNewToStaffs(newStaff));
  },

  // Internal
  // --------

  _persistAndLogOutIfSelf(staff) {
    return this.get('dataService')
      .persist(staff)
      .then(() => {
        if (staff.get('isAuthUser')) {
          this.get('authService').logout();
        }
      });
  },
  _logInAfterCreate(staffObj, password) {
    this.get('notifications').success(SUCCESS_MSG);
    const staff = this.get('store').push(
      this.get('store').normalize(Constants.MODEL.STAFF, staffObj)
    );
    return this.get('authService')
      .login(staff.get('username'), password)
      .then(() => {
        this.get('notifications').success(COMPLETE_MSG_PREFIX + staff.get('name'));
        this.get('router').transitionTo('none');
      });
  },
});
