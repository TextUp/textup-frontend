import Route from '@ember/routing/route';
import TypeUtils from 'textup-frontend/utils/type';

// TODO remove?
export function controllerNameForRoute(route) {
  return Route.detectInstance(route) ? route.get('controllerName') || route.get('routeName') : '';
}

export function tryRollback(model) {
  if (TypeUtils.isAnyModel(model)) {
    model.rollbackAttributes();
  }
}

export function abortTransition(transition) {
  if (TypeUtils.isTransition(transition)) {
    transition.abort();
    // Manual fix for the problem of URL getting out of sync when pressing the back button
    // even though we are aborting the transition
    // see https://stackoverflow.com/a/24070956
    if (window.history) {
      window.history.forward();
    }
  }
}
