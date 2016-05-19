import Messages from 'ember-cp-validations/validators/messages';

export default Messages.extend({
	every: '{description} must all be valid',
	any: '{description} must have at least one valid'
});
