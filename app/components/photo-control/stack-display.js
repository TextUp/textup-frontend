import Ember from 'ember';
import PhotoLoader from '../../mixins/photo-loader-component';
import callIfPresent from '../../utils/call-if-present';

const {
    computed,
    isPresent,
    isNone,
    RSVP: {
        Promise
    },
    $
} = Ember;

export default PhotoLoader.extend({

    classNames: 'stack-display',
    classNameBindings: ['_isLoading:loading', '_hasMultiple:multiple-pictures',
        '_hasTwo:two-pictures', 'readonly'
    ],

    // Private properties
    // ------------------

    _currentPreview: null,

    // Computed properties
    // -------------------

    $previewContainer: computed(function() {
        return this.$('.preview-container');
    }),
    $previewImg: computed(function() {
        return this.$('.preview-container img');
    }),
    $removeControl: computed(function() {
        return this.$('.preview-container .photo-control-remove');
    }),
    numImages: computed('imageLinks.[]', function() {
        const num = this.get('imageLinks.length');
        return isPresent(num) ? num : 0;
    }),

    _hasMultiple: computed('imageLinks.[]', function() {
        return this.get('imageLinks.length') > 2;
    }),
    _hasTwo: computed('imageLinks.[]', function() {
        return this.get('imageLinks.length') === 2;
    }),

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);
        const elId = this.elementId;
        this.$().on(`click.${elId}`, '.photo-control-remove', this._triggerRemoveForItem.bind(this));
    },
    willDestroyElement: function() {
        this._super(...arguments);
        const elId = this.elementId;
        this.$().off(`click.${elId}`);
    },

    // Overrides
    // ---------

    _doStart: function() {
        this._loadPreview(this.get('imageLinks.firstObject'));
    },
    _doRebuild: function(toTryNext) {
        if (toTryNext === this.get('imageLinks.firstObject') ||
            isNone(this.get('currentPreview'))) {
            this._loadPreview(toTryNext);
        } else {
            this._loadNotPreview(toTryNext);
        }
    },
    _doLoadFinish: function() {
        // check that (1) there is a current preview and (2) if there is a current preview
        // that the preview hasn't been removed
        if (this._isPreviewPresentAndValid()) {
            return;
        }
        this._clearPreview();
        const alreadyTried = this.get('_linksTriedSoFar'),
            links = this.get('imageLinks'),
            numLinks = links.length;
        for (let i = 0; i < numLinks; ++i) {
            const link = links[i];
            if (alreadyTried[link]) {
                this._setPreview(link);
                break;
            }
        }
    },

    // Removing preview item
    // ----------------------

    _triggerRemoveForItem: function() {
        const $removeControl = this.get('$removeControl');
        $removeControl.addClass('loading');
        // updating preview image happens after trigger is done, imageLinks is modified,
        // rebuild is triggered, and rebuild finishes
        Promise
            .all([callIfPresent(this.get('doRemove'), this.get('_currentPreview'))])
            .catch(() => $removeControl.removeClass('loading').addClass('error'));
    },
    _isPreviewPresentAndValid: function() {
        const currentPreview = this.get('_currentPreview');
        if (isNone(currentPreview)) {
            return false;
        }
        return this.get('imageLinks').indexOf(currentPreview) !== -1;
    },

    // Loading preview/non-preview methods
    // -----------------------------------

    _loadPreview: function(imgSrc) {
        const $img = this.get('$previewImg'),
            doNow = this._doIfPreview.bind(this),
            doNext = this._doNextIfPreview.bind(this);
        this._loadImage($img, imgSrc, doNow, doNext);
    },
    _loadNotPreview: function(imgSrc) {
        const $img = $(new Image());
        this._loadImage($img, imgSrc, null, this._doNextIfNotPreview.bind(this));
    },

    _doIfPreview: function(isSuccess, $img, imgSrc) {
        if (isSuccess) {
            this._setPreview(imgSrc);
        } else {
            this._clearPreview();
        }
    },
    _setPreview: function(imgSrc) {
        const $preview = this.get('$previewImg'),
            doSet = () => {
                this.set('_currentPreview', imgSrc);
                $preview.addClass('loaded');
                this.get('$removeControl').fadeIn();
            };
        if ($preview.attr('src') !== imgSrc) {
            $preview
                .one('load', doSet)
                .one('error', this._clearPreview.bind(this))
                .attr('src', imgSrc);
        } else {
            doSet();
        }
    },
    _clearPreview: function() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.set('_currentPreview', null);
        this.get('$previewImg')
            .removeClass('loaded')
            .attr('src', null);
        this.get('$removeControl')
            .fadeOut()
            .removeClass('loading error');
    },
    _doNextIfPreview: function(isSuccess, $img, imgSrc, toTryNext) {
        if (isSuccess) {
            this._loadNotPreview(toTryNext);
        } else {
            this._loadPreview(toTryNext);
        }
    },
    _doNextIfNotPreview: function(isSuccess, $img, imgSrc, toTryNext) {
        this._loadNotPreview(toTryNext);
    }
});