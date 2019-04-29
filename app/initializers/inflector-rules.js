import Inflector from 'ember-inflector';

export function initialize() {
  Inflector.inflector.uncountable('staff');
  Inflector.inflector.uncountable('media');
}

export default {
  name: 'inflector-rules',
  initialize,
};
