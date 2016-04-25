import Ember from 'ember';

export default Ember.Controller.extend({
	testNumbers: [{
		number: '111 222 3333',
		isValid: true
	}, {
		number: '112 222 3333',
		isValid: true
	}],
	otherStaffs: [{
		name: 'Stamy Lee',
		id: 2,
	}, {
		name: 'Stanislaus Okinawa',
		id: 3,
	}, {
		name: 'Stanley Cutie-Candy Bai',
		id: 4,
	}],
	contact: {
		id: 1,
		actions: [],
		status: 'unread',
		isShared: false,
		name: 'Mike Lee',
		timeAgo: '3 days ago',
		tags: [{
			color: "#1BA5E0",
			name: "Rapid Rehousing"
		}, {
			color: "#d3d3d3",
			name: "WO"
		}, {
			color: "#f8f",
			name: "Monday Group"
		}],
		sharedWith: [{
			id: 2,
			permission: 'DELEGATE'
		}, {
			id: 4,
			permission: 'VIEW'
		}]
	},
	tags: [{
		id: 1,
		color: "#493",
		name: "Housing First",
		actions: []
	}, {
		id: 2,
		color: "#1BA5E0",
		name: "Rapid Rehousing",
		actions: []
	}, {
		id: 3,
		color: "#d3d3d3",
		name: "WO",
		actions: []
	}, {
		id: 4,
		color: "#dd3",
		name: "Woman's Collective Interest Group",
		actions: []
	}, {
		id: 5,
		color: "#f8f",
		name: "Monday Group",
		actions: []
	}],
	records: [],
	totalNumRecords: 200,

	actions: {
		loadMore: function() {

			this.get('records').pushObjects(this._buildLoadMore());

			return new Ember.RSVP.Promise(function(resolve) {
				Ember.run.later(this, resolve, 2000);
			});
		},
	},

	_buildLoadMore: function() {
		const toBeAdded = [],
			numToAdd = 10;
		while (toBeAdded.length < numToAdd) {
			const rand = Math.random(),
				rand2 = Math.random(),
				rand3 = Math.random();
			let object = {};

			if (rand > 0.5) {
				object.type = 'CALL';
				if (rand3 > 0.5) {
					object.hasVoicemail = true;
					object.voicemailUrl = 'http://jPlayer.org/audio/mp3/Miaow-07-Bubble.mp3';
					object.voicemailInSeconds = 39;
				} else {
					object.durationInSeconds = 3;
				}
			} else {
				object.type = 'TEXT';
				object.hasAwayMessage = (rand3 > 0.5);
				object.contents = (rand * 1000) + ' CONTENTS';
			}

			object.whenCreated = '3 days ago';
			object.outgoing = (rand2 > 0.5);
			if (object.outgoing) {
				object.numSuccess = 1;
				object.authorName = 'Kiki Bai';
				object.receipts = [{
					status: 'SUCCESS',
					receivedBy: '333 940 3920'
				}, {
					status: 'FAILED',
					receivedBy: '930 293 9201'
				}];
			} else {
				object.numSuccess = 1;
				object.authorName = '930 293 9201';
				object.receipts = [{
					status: 'SUCCESS',
					receivedBy: '401 392 9392'
				}];
			}
			toBeAdded.pushObject(object);
		}
		return toBeAdded;
	},

	_loadInitialRecords: function() {
		this.set('records', [{
			whenCreated: '3 days ago',
			outgoing: false,
			type: 'CALL',
			authorName: '333 940 3920',
			durationInSeconds: 3,
			hasVoicemail: false,
			receipts: [{
				status: 'SUCCESS',
				receivedBy: '401 392 9392'
			}]
		}, {
			whenCreated: '3 days ago',
			outgoing: false,
			type: 'CALL',
			authorName: '333 940 3920',
			hasVoicemail: true,
			voicemailUrl: 'http://jPlayer.org/audio/mp3/Miaow-07-Bubble.mp3',
			voicemailInSeconds: 39,
			receipts: [{
				status: 'BUSY',
				receivedBy: '401 392 9392'
			}]
		}, {
			whenCreated: '3 days ago',
			numSuccess: 1,
			outgoing: true,
			type: 'TEXT',
			authorName: 'Kiki Bai',
			contents: "I'll be in the office in the afternoon. I am now going to proceed to write an exceedingly long text message to you to see how text wrapping works.",
			receipts: [{
				status: 'SUCCESS',
				receivedBy: '333 940 3920'
			}, {
				status: 'FAILED',
				receivedBy: '930 293 9201'
			}]
		}, {
			whenCreated: '3 days ago',
			outgoing: false,
			type: 'TEXT',
			authorName: '930 293 9201',
			contents: "When are you going to be in the office today?",
			receipts: [{
				status: 'SUCCESS',
				receivedBy: '401 392 9392'
			}]
		}, {
			whenCreated: '3 days ago',
			numSuccess: 2,
			outgoing: true,
			type: 'CALL',
			authorName: 'Kiki Bai',
			durationInSeconds: 292,
			hasVoicemail: false,
			receipts: [{
				status: 'SUCCESS',
				receivedBy: '333 940 3920'
			}, {
				status: 'SUCCESS',
				receivedBy: '930 293 9201'
			}]
		}, {
			whenCreated: '3 days ago',
			numSuccess: 0,
			outgoing: true,
			type: 'TEXT',
			authorName: 'Kiki Bai',
			contents: "I'll be in the office in the afternoon.",
			receipts: [{
				status: 'PENDING',
				receivedBy: '333 940 3920'
			}]
		}, {
			whenCreated: '3 days ago',
			outgoing: false,
			hasAwayMessage: true,
			type: 'TEXT',
			authorName: '930 293 9201',
			contents: "Got it. See you then.",
			receipts: [{
				status: 'SUCCESS',
				receivedBy: '401 392 9392'
			}]
		}]);

		this.get('records').pushObjects(this._buildLoadMore());
		this.get('records').pushObjects(this._buildLoadMore());
	},
});
