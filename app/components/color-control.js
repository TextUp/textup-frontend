import { htmlSafe } from '@ember/template';
import Component from '@ember/component';
import { computed } from '@ember/object';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';
import tc from 'tinycolor2';

export default Component.extend({
  disabled: defaultIfAbsent(false),
  placeholder: defaultIfAbsent('Pick a color on the right'),
  color: defaultIfAbsent('#1ba5e0'),
  contrast: defaultIfAbsent(50),
  scrollSelector: defaultIfAbsent('#container'),
  floatMode: defaultIfAbsent('offsetParent'),

  classNames: 'color-input',

  // Internal properties
  // -------------------

  _hexColor: computed('color', {
    get() {
      return htmlSafe(tc(this.get('color')).toHexString());
    },
    set(key, value) {
      this.set('color', value);
      return value;
    },
  }),
  _complement: computed('_hexColor', function() {
    const tColor = tc(this.get('color')),
      ct = this.get('contrast'),
      complement = tColor.isLight() ? tColor.darken(ct) : tColor.lighten(ct);
    return htmlSafe(complement.toString());
  }),
  _inputStyle: computed('_hexColor', '_complement', function() {
    const hexColor = this.get('_hexColor'),
      complement = this.get('_complement');
    return htmlSafe(`background-color: ${hexColor}; color: ${complement};`);
  }),
});
