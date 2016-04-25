import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
	floating: defaultIfAbsent(true),
	bodyClickClose: defaultIfAbsent(true),
	clickOutToClose: defaultIfAbsent(true),
	animation: defaultIfAbsent('fade'),
	tabindex: defaultIfAbsent(false),
});
