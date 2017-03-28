import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import InViewportMixin from 'ember-in-viewport';

const {
    computed,
    isArray,
    isPresent,
    $,
    copy,
    isNone,
    run
} = Ember;

export default Ember.Component.extend(InViewportMixin, {

    imageLinks: defaultIfAbsent([]),

    readonly: defaultIfAbsent(true),
    deferred: defaultIfAbsent(true), // default loading until enters viewport
    delayThreshold: defaultIfAbsent(300),

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

    // called when the user is trying to remove an image
    // passed the src of the image to remove
    // returns promise and also modifies imageLinks
    doRemove: null,

    itemClass: defaultIfAbsent(''),

    // Private properties
    // ------------------

    _isLoading: defaultIfAbsent(false),

    // Computed properties
    // -------------------

    hasImages: computed('imageLinks.[]', function() {
        const links = this.get('imageLinks');
        return isArray(links) && links.length > 0;
    }),
    // map of links tried so far to outcome, true for success, false for failure
    _linksTriedSoFar: computed(function() {
        return Object.create(null);
    }),

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);
        const shouldWait = this.get('deferred');
        // from ember-in-viewport
        this.set('viewportEnabled', shouldWait);
        if (!shouldWait) {
            this.startDisplay();
        }
    },
    willDestroyElement: function() {
        this._super(...arguments);
        this.stopDisplay();
    },
    didEnterViewport: function() {
        this.startDisplay();
    },

    // Methods
    // -------

    startDisplay: function() {
        if (this.get('hasImages')) {
            this._doStart();
        }
        this.addObserver('imageLinks.[]', this, this._observeLinksChange);
    },
    stopDisplay: function() {
        this.removeObserver('imageLinks.[]', this, this._observeLinksChange);
    },
    _observeLinksChange: function() {
        run.debounce(this, this._rebuildOnLinksChange, this.get('delayThreshold'));
    },
    _rebuildOnLinksChange: function() {
        if (!this.get('hasImages')) {
            return this._doLoadFinish();
        }
        const toTryNext = this._getNextToTry();
        if (isPresent(toTryNext)) {
            this._doRebuild(toTryNext);
        } else {
            this._doLoadFinish();
        }
    },

    _doStart: function() {
        this._doLoadNextImage(this.get('imageLinks.firstObject'));
    },
    _doRebuild: function(imgSrc) {
        this._doLoadNextImage(imgSrc);
    },
    _doLoadNextImage: function(imgSrc) {
        const $img = $(new Image()),
            doNow = this._doNow.bind(this),
            doNext = this._doNext.bind(this);
        this._loadImage($img, imgSrc, doNow, doNext);
    },

    _loadImage: function($img, imgSrc, doNow = null, doNext = null) {
        const elId = this.elementId,
            eventNames = `load.${elId} error.${elId}`;
        this.set('_isLoading', true);
        $img
            .off(eventNames)
            .one(eventNames, this._handleImageLoad.bind(this, $img, imgSrc, doNow, doNext))
            .attr('src', imgSrc);
    },
    _handleImageLoad: function($img, imgSrc, doNow, doNext, event) {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        const alreadyTried = this.get('_linksTriedSoFar'),
            isSuccess = (event.type === 'load'),
            hookToCall = isSuccess ? 'onOneSuccess' : 'onOneFailure';
        alreadyTried[imgSrc] = isSuccess;

        callIfPresent(this.get(hookToCall), $img, imgSrc);
        callIfPresent(doNow, isSuccess, $img, imgSrc);

        // must update alreadyTried BEFORE getting next to try
        const toTryNext = this._getNextToTry();
        if (isPresent(toTryNext)) {
            callIfPresent(doNext, isSuccess, $img, imgSrc, toTryNext);
        } else {
            callIfPresent(this.get('onAllTried'), copy(alreadyTried));
            this._doLoadFinish();
            this.set('_isLoading', false);
        }
    },

    _getNextToTry: function() {
        const links = this.get('imageLinks'),
            alreadyTried = this.get('_linksTriedSoFar'),
            len = links.length;
        for (let i = 0; i < len; ++i) {
            const link = links.objectAt(i);
            if (isNone(alreadyTried[link])) {
                return link;
            }
        }
    },
    /* jshint unused:vars */
    _doNow: function(isSuccess, $img, imgSrc) {
        return;
    },
    _doLoadFinish: function() {
        return;
    },
    _doNext: function(isSuccess, $img, imgSrc, toTryNext) {
        this._doLoadNextImage(toTryNext);
    }
});