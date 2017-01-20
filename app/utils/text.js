import Ember from 'ember';
import Inflector from 'ember-inflector';

const {
    isBlank,
    isPresent
} = Ember;

function pluralize(word, count) {
    const infl = Inflector.inflector;
    if (isNaN(count)) {
        return word;
    }
    return parseInt(count) === 1 ? infl.singularize(word) : infl.pluralize(word);
}

function capitalize(word, numToCap) {
    if (isBlank(word)) {
        return word;
    }
    if (isPresent(numToCap)) {
        return word.slice(0, numToCap).toUpperCase() + word.slice(numToCap);
    } else {
        return word.toUpperCase();
    }
}

// parameters, in order:
//  - text to abbreviate
//  - max length of abbreviate, if absent will take first letter of each word
function abbreviate(content, maxLength) {
    if (isBlank(content)) {
        return content;
    }
    const abbrev = String(content)
        .split(/\s+/)
        .map(function(val) {
            return val[0] ? val[0] : '';
        })
        .join('')
        .toUpperCase();
    return isPresent(maxLength) ? abbrev.slice(0, maxLength) : abbrev;
}

export {
    pluralize,
    capitalize,
    abbreviate
};