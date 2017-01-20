import Ember from 'ember';
import {
    capitalize as doCapitalize
} from '../utils/text';

export function capitalize([word, numToCap] /*, hash*/ ) {
    return doCapitalize(word, numToCap);
}

export default Ember.Helper.helper(capitalize);