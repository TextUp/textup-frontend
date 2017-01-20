import tc from 'npm:tinycolor2';

function complement(color, constrast = 50) {
    const tColor = tc(color);
    return (tColor.isLight() ? tColor.darken(constrast) : tColor.lighten(constrast)).toString();
}

export {
    complement
};