import * as TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';

export function tryFindPhoneOwnerFromUrl(authUser, urlIdent) {
  if (urlIdent === authUser.get(Constants.PROP_NAME.URL_IDENT)) {
    return authUser;
  } else {
    return authUser.get('teamsWithPhones').findBy(Constants.PROP_NAME.URL_IDENT, urlIdent);
  }
}

export function isActivePhoneOwner(phoneOwner) {
  const isPhoneActive = phoneOwner && phoneOwner.get('phone.content.isActive');
  if (TypeUtils.isStaff(phoneOwner)) {
    return isPhoneActive && (phoneOwner.get('isStaff') || phoneOwner.get('isAdmin'));
  } else {
    return isPhoneActive;
  }
}

export function determineAppropriatePosition(thisRoute, authService) {
  const authUser = authService.get('authUser'),
    phoneOwner = tryFindFirstActivePhoneOwnerFromStaff(authUser);
  if (phoneOwner) {
    thisRoute.transitionTo('main', phoneOwner);
  } else if (canStaffAccessAdminDashboard(authUser)) {
    thisRoute.transitionTo('admin');
  } else {
    thisRoute.transitionTo('none');
  }
}

// Helpers
// -------

function tryFindFirstActivePhoneOwnerFromStaff(authUser) {
  if (authUser.get('phone.content.isActive')) {
    return authUser;
  } else {
    return authUser.get('teamsWithPhones').findBy('phone.content.isActive', true);
  }
}

function canStaffAccessAdminDashboard(authUser) {
  return authUser.get('isAdmin') && authUser.get('org.content.isApproved');
}
