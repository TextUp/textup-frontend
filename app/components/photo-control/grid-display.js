import Ember from 'ember';
import PhotoLoader from '../../mixins/photo-loader-component';
import callIfPresent from '../../utils/call-if-present';

const {
    isNone,
    computed,
    RSVP: {
        Promise
    },
    $
} = Ember;

export default PhotoLoader.extend({

    classNames: 'grid-display',
    classNameBindings: ['_isLoading:loading', 'readonly', 'hasItemsToDisplay:not-empty'],

    // Private properties
    // ------------------

    _displayedLinks: computed(function() {
        return [];
    }),

    // Computed properties
    // -------------------

    hasItemsToDisplay: computed('_displayedLinks.[]', function() {
        const displayed = this.get('_displayedLinks');
        return displayed ? displayed.length > 0 : false;
    }),
    $container: computed(function() {
        return this.$('.grid-item-container');
    }),

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);
        const elId = this.elementId,
            $container = this.get('$container');
        $container.on(`click.${elId}`, '.photo-control-remove', this._triggerRemoveForItem.bind(this));
    },
    willDestroyElement: function() {
        this._super(...arguments);
        const elId = this.elementId,
            $container = this.get('$container');
        $container.off(`click.${elId}`);
    },

    // Overrides
    // ---------

    _doLoadFinish: function() {
        Ember.run.scheduleOnce('afterRender', this, function() {
            this._doRemoveMissingLinks();
            this._doAddLinksNotAlreadyDisplayed();
        });
    },
    _doNow: function(isSuccess, $img, imgSrc) {
        const $toInsert = isSuccess ? this._buildGridItem($img) : this._buildErrorItem(imgSrc);
        this.get('$container').append($toInsert);
        this.get('_displayedLinks').pushObject(imgSrc);
    },

    // Add/display grid items
    // ----------

    _buildGridItem: function($img) {
        const itemClass = this.get('itemClass'),
            imgSrc = $img.attr('src'),
            $item = $(`<div class="grid-item ${itemClass}" data-src='${imgSrc}'>
                    <span class="photo-control-remove"></span>
                </div>`);
        $item.append($img);
        return $item;
    },
    _buildErrorItem: function(imgSrc) {
        return $(`<div class="grid-item error" data-src='${imgSrc}'>
                <span class="photo-control-remove"></span>
                <span class="fa fa-exclamation center"></span>
            </div>`);
    },

    _doAddLinksNotAlreadyDisplayed: function() {
        const alreadyTried = this.get('_linksTriedSoFar'),
            links = this._getLinksStillToAdd();
        links.forEach((link) => {
            const outcome = alreadyTried[link];
            if (outcome) {
                const img = new Image();
                img.onload = () => this._doNow(outcome, $(img), link);
                img.onerror = () => this._doNow(false, null, link);
                img.src = link;
            } else {
                this._doNow(false, null, link);
            }
        });
    },
    _getLinksStillToAdd: function() {
        const displayMap = Object.create(null);
        this.get('_displayedLinks').forEach((link) => displayMap[link] = true);
        return this.get('imageLinks').filter(function(link) {
            return isNone(displayMap[link]);
        }).uniq();
    },

    // Remove grid items
    // -----------------

    _triggerRemoveForItem: function(event) {
        const $target = $(event.target),
            imgSrc = $target.parent('.grid-item').data('src');
        $target.addClass('loading');
        // removing from displayedLinks done in _doRemoveMissingLinks
        // which is called after trigger is done, imageLinks is modified,
        // rebuild is triggered, and rebuild finishes
        Promise
            .all([callIfPresent(this.get('doRemove'), imgSrc)])
            .catch(() => $target.removeClass('loading').addClass('error'));
    },
    _doRemoveMissingLinks: function() {
        const links = this._getLinksToRemove();
        if (links.length > 0) {
            const selector = this._buildSelectorFromLinks(links);
            this.$(selector).remove();
            this.get('_displayedLinks').removeObjects(links);
        }
    },
    _getLinksToRemove: function() {
        const currentMap = Object.create(null);
        this.get('imageLinks').forEach((link) => currentMap[link] = true);
        return this.get('_displayedLinks').filter(function(link) {
            return isNone(currentMap[link]);
        });
    },
    _buildSelectorFromLinks: function(links) {
        return links.map((link) => `[data-src='${link}']`).join(',');
    },
});