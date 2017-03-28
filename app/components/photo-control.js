import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';

const {
    computed,
    merge,
    get,
    RSVP: {
        Promise
    },
    $
} = Ember;

// Check that the photoswipe markup is already loaded somewhere.
// This component will not automatically inject markup.

export default Ember.Component.extend({

    imageLinks: defaultIfAbsent([]),

    display: defaultIfAbsent('stack'), // 'stack' or 'grid' or a custom value
    readonly: defaultIfAbsent(true),
    deferred: defaultIfAbsent(true),
    itemClass: defaultIfAbsent('photo-control-item'),

    // Loading

    // called when one of the links has succeeded in loading
    // passed the jQuery wrapped image object and the String image source
    // returns nothing
    onOneSuccess: null,
    // called when one of the links has failed in loading
    // passed the jQuery wrapped image object and the String image source
    // returns nothing
    onOneFailure: null,
    // called when all of the passed-in links have been attempted
    // passed a map of String image source to boolean outcome, true = success, fail otherwise
    // returns nothing
    onAllTried: null,

    // Create/Delete

    // called when user is trying to add a new image
    // passed the jQuery wrapped image object, MIME type, file size
    // returns promise and also modifies imageLinks
    doAdd: null,
    // called when the user is trying to remove an image
    // passed the src of the image to remove
    // returns promise and also modifies imageLinks
    doRemove: null,

    options: null, // gallery options to merge with defaults
    gallerySelector: defaultIfAbsent('.pswp'),

    classNames: 'photo-control',
    classNameBindings: 'readonly',

    // Private properties
    // ------------------

    _gallery: null, // the initialized (opened) gallery object
    _isUploading: defaultIfAbsent(false),
    _uploadIdentifier: defaultIfAbsent(1), // keep tracks of upload requests for cancellation
    _loadedImageData: defaultIfAbsent([]),

    // Computed properties
    // -------------------

    $galleryElement: computed('gallerySelector', function() {
        return $(this.get('gallerySelector')); // note may not be under component root
    }),
    $input: computed(function() {
        return this.$('input[type="file"]');
    }),
    $el: computed(function() {
        return this.$();
    }),
    _displayComponent: computed('display', function() {
        const display = this.get('display');
        switch (display) {
            case 'stack':
                return 'photo-control/stack-display';
            case 'grid':
                return 'photo-control/grid-display';
            default:
                return display;
        }
    }),
    _options: computed('options', function() {
        return merge({
            showHideOpacity: true,
            history: false,
            captionEl: false,
            shareEl: false,
            bgOpacity: 0.85,
            getThumbBoundsFn: this._getPreviewBounds.bind(this)
        }, this.get('options'));
    }),
    _items: computed('imageLinks.[]', '_loadedImageData.[]', function() {
        const linksMap = Object.create(null),
            items = [];
        this.get('imageLinks').forEach((link) => linksMap[link] = true);
        this.get('_loadedImageData').forEach((loadedData) => {
            if (linksMap[get(loadedData, 'src')]) {
                items.pushObject(loadedData);
            }
        });
        return items;
    }),

    // Events
    // ------

    didInsertElement: function() {
        const itemClass = this.get('itemClass'),
            elId = this.elementId,
            $el = this.get('$el'),
            $input = this.get('$input');
        $el.on(`click.${elId}`, `.${itemClass}`, this._openGallery.bind(this));
        $input.on(`change.${elId}`, this._doFilesUpload.bind(this));
    },
    willDestroyElement: function() {
        const gallery = this.get('_gallery'),
            elId = this.elementId,
            $el = this.get('$el'),
            $input = this.get('$input');
        if (gallery) {
            gallery.destroy();
        }
        $el.off(`click.${elId}`);
        $input.off(`change.${elId}`);
    },

    // Actions
    // -------

    actions: {
        onOneSuccess: function($img) {
            const loadedData = this._extractDataFromImage($img);
            this.get('_loadedImageData').pushObject(loadedData);
            const gallery = this.get('_gallery');
            if (gallery) {
                gallery.items.push(loadedData);
            }
            callIfPresent(this.get('onOneSuccess'), ...arguments);
        },
    },

    // Uploading helpers
    // -----------------

    _doFilesUpload: function(event) {
        this.incrementProperty('_uploadIdentifier');
        const inputEl = event.target,
            files = inputEl.files || [inputEl.value],
            numFiles = files.length,
            doAdd = this.get('doAdd'),
            currentIdentifier = this.get('_uploadIdentifier'),
            promises = [],
            isCurrent = () => currentIdentifier === this.get('_uploadIdentifier'),
            onError = () => {
                if (!isCurrent()) {
                    return;
                }
                this.set('_isUploading', false);
                this.set('_isUploadError', true);
            };
        // convert images to files
        for (let i = 0; i < numFiles; ++i) {
            const file = files[i];
            if (file) {
                promises.pushObject(this._readImageFromFile(file));
            }
        }
        // wait for conversions to finish, setting loading state
        this.set('_isUploading', true);
        this.set('_isUploadError', false);
        Promise
            .all(promises)
            .then((outcomes) => {
                if (!isCurrent()) {
                    return;
                }
                Promise
                    .all(outcomes.map((data) => callIfPresent(doAdd, ...data)))
                    .then(() => {
                        if (!isCurrent()) {
                            return;
                        }
                        inputEl.value = null;
                        this.set('_isUploading', false);
                        this.set('_isUploadError', false);
                    })
                    .catch(onError);
            })
            .catch(onError);
    },
    _readImageFromFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader(),
                img = new Image();
            // bind event handlers
            reader.onload = () => img.src = reader.result;
            reader.onerror = reject;
            img.onload = () => resolve([$(img), file.type, file.size]);
            img.onerror = reject;
            // start reading in file
            reader.readAsDataURL(file);
        });
    },

    // Display helpers
    // ---------------

    _openGallery: function(event) {
        const targetSrc = this._getTargetImageSrc(event);
        if (!targetSrc) {
            return;
        }
        const items = this.get('_items');
        if (items.length === 0) {
            return;
        }
        const index = this._getImageIndex(targetSrc, items),
            opts = merge(this.get('_options'), {
                index: index
            }),
            $gallery = this.get('$galleryElement'),
            ps = new PhotoSwipe($gallery[0], PhotoSwipeUI_Default, items, opts);
        this.set('_gallery', ps);
        ps.listen('close', this._onGalleryClosing.bind(this));
        ps.init();
    },
    _onGalleryClosing: function() {
        this.set('_gallery', null);
    },

    _extractDataFromImage: function($img) {
        const img = $img[0];
        return {
            src: img.src,
            w: img.naturalWidth,
            h: img.naturalHeight
        };
    },
    _getTargetImageSrc: function(event) {
        const $target = $(event.target),
            img = $target.is('img') ? $target[0] : $target.find('img')[0];
        return img && img.src;
    },
    _getImageIndex: function(imageSrc, items) {
        const numItems = items.length;
        let foundIndex = 0;
        for (let i = 0; i < numItems; ++i) {
            if (items.objectAt(i).src === imageSrc) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    },
    _getPreviewBounds: function(index) {
        const itemClass = this.get('itemClass'),
            displayedItem = this.$(`.${itemClass}`).get(index);
        if (displayedItem) {
            const pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                bounds = displayedItem.getBoundingClientRect(); // relative to viewport
            return {
                x: bounds.left,
                y: bounds.top + pageYScroll,
                w: bounds.width
            };
        }
    }
});