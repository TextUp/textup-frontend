import Ember from 'ember';

export function controllerNameForRoute(route) {
  if (Ember.Route.detectInstance(route)) {
    return route.get('controllerName') || route.get('routeName');
  }
  return '';
}
