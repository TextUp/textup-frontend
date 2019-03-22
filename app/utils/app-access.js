import * as ArrayUtils from 'textup-frontend/utils/array';
import * as TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';

const { isPresent, typeOf } = Ember;

export function tryFindPhoneOwnerFromUrl(authUser, urlIdent) {
  if (typeOf(authUser) === 'instance' && isPresent(urlIdent)) {
    return ArrayUtils.ensureArrayAndAllDefined(authUser.get('allActivePhoneOwners')).findBy(
      Constants.PROP_NAME.URL_IDENT,
      urlIdent
    );
  } else {
    return null;
  }
}

export function isActivePhoneOwner(phoneOwner) {
  const isPhoneActive =
    typeOf(phoneOwner) === 'instance' && phoneOwner.get('phone.content.isActive');
  if (TypeUtils.isStaff(phoneOwner)) {
    return !!(isPhoneActive && (phoneOwner.get('isStaff') || phoneOwner.get('isAdmin')));
  } else {
    return !!isPhoneActive;
  }
}

export function determineAppropriateLocation(thisRoute, authService) {
  if (typeOf(thisRoute) === 'instance' && typeOf(authService) === 'instance') {
    const authUser = authService.get('authUser'),
      phoneOwner = tryFindFirstActivePhoneOwnerFromStaff(authUser);
    if (phoneOwner) {
      thisRoute.transitionTo('main', phoneOwner);
    } else if (canStaffAccessAdminDashboard(authUser)) {
      transitionIfNotAlreadyThere(thisRoute, 'admin');
    } else {
      transitionIfNotAlreadyThere(thisRoute, 'none');
    }
  }
}

// Helpers
// -------

function transitionIfNotAlreadyThere(thisRoute, targetRouteName) {
  if (thisRoute.get('routeName').indexOf(targetRouteName) === -1) {
    thisRoute.transitionTo(targetRouteName);
  }
}

function tryFindFirstActivePhoneOwnerFromStaff(authUser) {
  return authUser.get('allActivePhoneOwners').findBy('phone.content.isActive', true);
}

function canStaffAccessAdminDashboard(authUser) {
  return authUser.get('isAdmin') && authUser.get('org.content.isApproved');
}
