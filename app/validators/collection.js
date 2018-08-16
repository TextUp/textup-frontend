import CollectionValidator from 'ember-cp-validations/validators/collection';

export default CollectionValidator.extend({
  _test: null,

  buildOptions: function() {
    const options = this._super(...arguments);
    if (options.for && !/^(every|any)$/i.test(options.for)) {
      options.for = 'every';
    }
    if (!options.test || typeof options.test !== 'function') {
      options.test = () => true;
    }
    // cache and then remove test function so that it isn't
    // inadvertently called when options are processed
    this.set('_test', options.test);
    delete options.test;

    return options;
  },
  validate: function(value, options) {
    const result = this._super(...arguments);
    if (result === true && options.for) {
      const doTest = this.get('_test');
      if (options.for === 'every') {
        return value.every(doTest) ? true : this.createErrorMessage('every', value, options);
      } else {
        return value.any(doTest) ? true : this.createErrorMessage('any', value, options);
      }
    } else {
      return result;
    }
  }
});
