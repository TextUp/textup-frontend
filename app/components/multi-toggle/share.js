import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
	singleOptions: defaultIfAbsent([{
		display: 'Not Shared',
		command: 'STOP',
		color: '#d3d3d3'
	}, {
		display: 'View',
		command: 'VIEW',
		color: '#76c9ec'
	}, {
		display: 'Collaborate',
		command: 'DELEGATE',
		color: '#1BA5E0'
	}]),
	multipleOptions: defaultIfAbsent([{
		display: 'Stop Sharing',
		command: 'STOP',
		color: '#c9302c'
	}, {
		display: 'View',
		command: 'VIEW',
		color: '#76c9ec'
	}, {
		display: 'Collaborate',
		command: 'DELEGATE',
		color: '#1BA5E0'
	}]),
});
