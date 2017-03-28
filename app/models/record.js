import DS from 'ember-data';
import Ember from 'ember';
import NoteModel from '../mixins/note-model';
import md5 from 'npm:blueimp-md5';

// Cannot create polymorphic subclasses because
// we load records from the 'records' endpoint
const {
	get,
	isArray,
	isPresent,
	computed,
	computed: {
		equal: eq,
		notEmpty,
		sort,
		or
	},
	RSVP: {
		Promise
	}
} = Ember;

export default DS.Model.extend(NoteModel, {

	init: function() {
		this._super(...arguments);
		this._reset();
	},
	rollbackAttributes: function() {
		this._super(...arguments);
		this._reset();
	},
	_reset: function() {
		this.setProperties({
			isAddingNoteAfter: false,
			shouldAddLocation: false,
			isEditingNote: false,
			doAddAfterThis: null,
			toggleNoteDeleteStatus: false,
			recipients: [],
			imagesToAdd: [],
			imagesToRemove: []
		});
		const images = this.get('images');
		if (isPresent(images) && isArray(images)) {
			const toBeRemoved = images.filterBy('willBeAdded', true);
			images.removeObjects(toBeRemoved);
		}
	},

	// Attributes
	// ----------

	whenCreated: DS.attr('date'),
	outgoing: DS.attr('boolean'),
	hasAwayMessage: DS.attr('boolean'),
	type: DS.attr('string'), // call | text | if null, then note

	authorName: DS.attr('string'),
	authorId: DS.attr('number'),
	authorType: DS.attr('string'),

	receipts: DS.hasMany('receipts'),
	// belong to either a contact or a tag
	contact: DS.belongsTo('contact'),
	tag: DS.belongsTo('tag'),

	// Call
	// ----

	durationInSeconds: DS.attr('number'),
	hasVoicemail: DS.attr('boolean'),

	// Call (voicemail)
	// ----------------

	voicemailUrl: DS.attr('string'),
	voicemailInSeconds: DS.attr('number'),

	// Text
	// ----

	contents: DS.attr('string'),

	// Note
	// ----

	hasBeenDeleted: DS.attr('boolean'),
	unsortedRevisions: DS.hasMany('revision'),
	revisionsSorting: ['whenChanged:desc'],
	revisions: sort('unsortedRevisions', 'revisionsSorting'),
	// list of string error messages in the event that some of the images we are trying
	// to upload failed because of a specified error
	uploadErrors: DS.attr('collection'),
	// set by the serializer when it normalizing the incoming payload from the backend
	// to track whether or not we initially had a location as we can't get this information
	// from changedAttributes
	_originallyHasLocation: DS.attr('boolean'),

	// Not attributes
	// --------------

	recipients: null,
	// for any record item, true when we are trying to add a note after this item
	isAddingNoteAfter: false,
	// for note, true when should serialize with new
	shouldAddLocation: false,
	// for note, set to a record item that we should add this note after
	doAddAfterThis: null,
	// for note, set to true when editing to show an unbound version of the note in the record
	// so that we don't use too much bandwidth loading images and location previews when we
	// still are changing these values
	isEditingNote: false,
	// use this to toggle note's deletion status and in the serializer update
	// we do this to avoid triggering the rebuild on record-model mixin each time a note is
	// marked and un-marked for delete if we set the hasBeenDeleted attribute directly
	toggleNoteDeleteStatus: false,

	imagesToAdd: null,
	imagesToRemove: null,

	// Computed properties
	// -------------------

	hasManualChanges: or('hasRecipients', 'location.content.isDirty', 'toggleNoteDeleteStatus',
		'hasImagesToAdd', 'hasImagesToRemove'),
	isText: eq('type', 'TEXT'),
	isCall: eq('type', 'CALL'),

	hasRecipients: notEmpty('recipients'),
	hasRevisions: notEmpty('unsortedRevisions'),

	hasImagesToAdd: notEmpty('imagesToAdd'),
	hasImagesToRemove: notEmpty('imagesToRemove'),

	successes: computed('receipts.@each.status', function() {
		return DS.PromiseArray.create({
			promise: new Promise((resolve, reject) => {
				this.get('receipts').then((receipts) => {
					resolve(receipts.filterBy('status', 'SUCCESS'));
				}, reject);
			})
		});
	}),
	numSuccesses: computed('successes.[]', function() {
		return DS.PromiseObject.create({
			promise: new Promise((resolve, reject) => {
				this.get('successes').then((successes) => {
					resolve(successes.length);
				}, reject);
			})
		});
	}),

	// Methods
	// -------

	addImage: function(imgSrc, mimeType) {
		const toAdd = this.get('imagesToAdd'),
			toRemove = this.get('imagesToRemove'),
			imageList = this.get('images'),
			removedImage = toRemove.findBy('src', imgSrc),
			data = imgSrc.split(',')[1];
		toAdd.pushObject({ // must be in format of a UploadItem (specified in API docs)
			mimeType,
			data,
			checksum: md5(data)
		});
		imageList.pushObject({
			key: imgSrc,
			link: imgSrc,
			willBeAdded: true // for restoring images when rolling back attributes
		});
		if (isPresent(removedImage)) {
			toRemove.removeObject(removedImage);
		}
	},
	removeImage: function(imgSrc) {
		const toRemove = this.get('imagesToRemove'),
			toAdd = this.get('imagesToAdd'),
			imageList = this.get('images'),
			image = imageList.findBy('link', imgSrc),
			addedImage = toAdd.findBy('src', imgSrc);
		if (isPresent(image)) {
			toRemove.pushObject({
				key: get(image, 'key'),
				src: imgSrc
			});
			imageList.removeObject(image);
		}
		if (isPresent(addedImage)) {
			toAdd.removeObject(addedImage);
		}
	},
});