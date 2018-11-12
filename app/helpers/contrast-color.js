import Ember from 'ember';
import tc from 'npm:tinycolor2';

export function contrastColor([color]) {
  const helper = tc(color),
    contrast = 50;
  if (helper.isValid()) {
    return (helper.isLight() ? helper.darken(contrast) : helper.lighten(contrast)).toString();
  }
}

export default Ember.Helper.helper(contrastColor);
