import Ember from 'ember';
import ArrayUtils from 'textup-frontend/utils/array';
import TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';

const { isPresent, typeOf } = Ember;

export function tryFindPhoneOwnerOrSelfFromUrl(authUser, urlIdent) {
  if (typeOf(authUser) === 'instance' && isPresent(urlIdent)) {
    if (authUser.get(Constants.PROP_NAME.URL_IDENT) === urlIdent) {
      return authUser;
    } else {
      return ArrayUtils.ensureArrayAndAllDefined(authUser.get('allActivePhoneOwners')).findBy(
        Constants.PROP_NAME.URL_IDENT,
        urlIdent
      );
    }
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

export function determineAppropriateLocation(thisRoute, authUser) {
  if (typeOf(thisRoute) === 'instance' && typeOf(authUser) === 'instance') {
    const phoneOwner = tryFindFirstActivePhoneOwnerFromStaff(authUser);
    if (phoneOwner) {
      thisRoute.transitionTo('main', phoneOwner);
    } else if (canStaffAccessAdminDashboard(authUser)) {
      transitionIfNotAlreadyThere(thisRoute, 'admin');
    } else {
      transitionIfNotAlreadyThere(thisRoute, 'none');
    }
  }
}

// TODO test this directly
export function canStaffAccessAdminDashboard(authUser) {
  return authUser.get('isAdmin') && authUser.get('org.content.isApproved');
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
