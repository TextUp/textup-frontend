import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';

export function controllerNameForRoute(route) {
  return Ember.Route.detectInstance(route)
    ? route.get('controllerName') || route.get('routeName')
    : '';
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
