import Ember from 'ember';
import {
    complement
} from '../utils/color';

export function contrastColor([color, contrast] /*, hash*/ ) {
    return complement(color, contrast);
}

export default Ember.Helper.helper(contrastColor);