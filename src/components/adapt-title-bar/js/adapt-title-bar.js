define(function (require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var TitleBar = ComponentView.extend({


        preRender: function () {
            this.$el.addClass("no-state");
            // Checks to see if the blank should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        postRender: function () {
            
            if (this.model.get('_noSticky')) {
                    this.$('.title-bar-outer').removeClass('stickyHeader');
            } else {
                    this.$('.title-bar-outer').addClass('stickyHeader');
            }

            //
            var block = this.model.getParent();
            if (block.get("_type") === "block") {
                var $block = $('.' + block.get("_id"));
                if ($block) {
                    if (this.model.get('_noSticky')) {
                        $block.removeClass('stickyHeaderBlock');
                    } else {
                        $block.addClass('stickyHeaderBlock');
                    }
                }
            }
            //

            this.setReadyStatus();
            this.$('.title-bar-inner').on('inview', _.bind(this.inview, this));
        },

        // Used to check if the blank should reset on revisit
        checkIfResetOnRevisit: function () {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function (event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.title-bar-inner').off('inview');
                    this.setCompletionStatus();
                }

            }
        }

    });

    Adapt.register('title-bar', TitleBar);

    return TitleBar;

});
