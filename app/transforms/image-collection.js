import Ember from 'ember';
import Collection from './collection';

const {
    isPresent: here,
    typeOf
} = Ember;

export default Collection.extend({
    deserialize: function() {
        return this._super(...arguments).filter(this._validateImageItem, this);
    },

    serialize: function() {
        return this._super(...arguments).filter(this._validateImageItem, this);
    },

    _validateImageItem: function(item) {
        return ['key', 'link'].every((k) => here(item[k]) && typeOf(item[k]) === 'string');
    },
});