import {
    default as tColor
} from 'npm:tinycolor2';

function complement(color, contrast = 50) {
    const tc = _getTC(color);
    return _validate(tc) ? _complement(tc, contrast) : null;
}

function validate(color) {
    return _validate(_getTC(color));
}

function toHexString(color) {
    const tc = _getTC(color);
    return _validate(tc) ? _toHexString(tc) : null;
}

// Helpers
// -------

function _getTC(color) {
    return tColor(color);
}

function _validate(tc) {
    return tc.isValid();
}

function _complement(tc, contrast) {
    return (tc.isLight() ? tc.darken(contrast) : tc.lighten(contrast)).toString();
}

function _toHexString(tc) {
    return tc.toHexString();
}

export {
    validate,
    complement,
    toHexString
};