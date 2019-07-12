/*jslint nomen:true, plusplus:true */
/*global define:false, console:false, $:false, _:false */
define(function (require) {
    "use strict";
    require('./lib/jquery.ba-throttle-debounce.js');
    var TAG = "SectionHeadings",
        Adapt = require('coreJS/adapt'),
        AdaptView = require('coreViews/adaptView'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        CSS_STICKY_HEADER = "stickyHeader",
        CSS_STICKY_HEADER_BLOCK = "stickyHeaderBlock",
        SectionHeadings = _.extend({

            emptyRect: {
                'left': 0,
                'top': 0,
                'right': 0,
                'bottom': 0,
                'height': 0,
                'width': 0
            },
            //public static
            initialize: function (model) {
                var headers = this.$headers = $("." + CSS_STICKY_HEADER),
                    i = headers.length,
                    thisHeaders;
                if (i === 0) {
                    //abort
                    this.remove();
                    return;
                } else {
                    //cache
                    thisHeaders = this.$thisHeaders = [];
                    while (i--) {
                        thisHeaders.unshift($(headers[i]));
                    }
                }
                //
                this._isRemoved = false;
                this.model = model;
                this.$window = $(window);
                this.topMargin = $('.navigation').height();
                this.$navTitle = $('.navigation .section-heading-title-inner');
                //
                this.removeBinded = _.bind(this.remove, this);
                this.listenTo(Adapt, 'remove', this.removeBinded);
                this.scrolling = $.throttle(this.model.get("throttle"), false, _.bind(this._whenScrolling, this));
                this.afterScroll = $.debounce(this.model.get("throttle") * 2, false, _.bind(this._whenScrolling, this));
                this.wheel = /*$.debounce(this.model.get("throttle") * 2, false, */ _.bind(this._whenScrolling, this); /*);*/
                //
                this.$window.off("scroll.adapt-section-headings")
                    .on("scroll.adapt-section-headings", this.scrolling)
                    .on("scroll.adapt-section-headings", this.afterScroll)
                    .off("wheel mousewheel.adapt-section-headings")
                    .on("wheel mousewheel.adapt-section-headings", this.wheel);


                this.scrolling();
            },


            _whenScrolling: function () {
                var headers = this.$thisHeaders,/*this.$headers,*/
                    i = headers ? headers.length : 0,
                    $thisHeader,
                    rect;
                while (i--) {

                    $thisHeader = /*$(this)*/ headers[i];
                    rect = this.getStickyHeaderRect($thisHeader);


                    if (rect.top + (rect.height * 0.75) < this.topMargin) {
                        if (this.$navTitle) {
                            this.$navTitle.text($thisHeader.text());
                        }
                        break;
                    }

                }
                if (i < 0) {
                    //send empty
                    if (this.$navTitle) {
                        this.$navTitle.text("");
                    }
                }
            },
            getStickyHeaderRect: function (sticky) {
                if (!sticky || sticky.length === 0) {
                    return this.emptyRect;
                }
                var r = sticky[0].getBoundingClientRect(),
                    rect = {
                        left: r.left,
                        top: r.top,
                        right: r.right,
                        bottom: r.bottom,
                        height: "height" in r ? r.height : r.bottom - r.top,
                        width: "width" in r ? r.width : r.right - r.left
                    };
                return rect;
            },
            remove: function () {
                if (this._isRemoved) {
                    return;
                }

                if (this.$window) {
                    this.$window.off("scroll.adapt-section-headings")
                        .off("wheel mousewheel.adapt-section-headings");
                }
                this.stopListening();

                this.scrolling = undefined;
                this.afterScroll = undefined;
                this.wheel = undefined;
                this.$window = undefined;
                this.$headers = undefined;
                this.model = undefined;
                this.topMargin = undefined;
                if (this.$navTitle) {

                    this.$navTitle.text("");
                    this.$navTitle = undefined;
                }

                //last thing:)
                this._isRemoved = true;
            }


        }, Backbone.Events),
        mergeConfigs = function (base, config) {

            var existBase = !_.isUndefined(base),
                existConfig = !_.isUndefined(config),
                newConfig;

            if (existBase && !existConfig) {
                return base;
            }
            if (!existBase && existConfig) {
                return config;
            }
            if (!existBase && !existConfig) {
                return {};
            }

            //copy
            newConfig = {};
            if (base.hasOwnProperty("_isEnabled")) {
                newConfig._isEnabled = base._isEnabled;
            }
            if (base.hasOwnProperty("throttle")) {
                newConfig.throttle = base.throttle;
            }

            //merge
            if (config.hasOwnProperty("_isEnabled")) {
                newConfig._isEnabled = config._isEnabled;
            }
            if (config.hasOwnProperty("throttle")) {
                newConfig.throttle = config.throttle;
            }

            return newConfig;
        };

    Adapt.on('pageView:ready', function (page) {

        var config = mergeConfigs(Adapt.config.get('_sectionHeadings'), page.model.get('_sectionHeadings')),
            model;


        if (!_.isUndefined(config) && config._isEnabled === false) {
            //dont use it - turned off
            return;
        }

        if (!config.hasOwnProperty("throttle")) {
            config.throttle = 150;
        }
        if (!config.hasOwnProperty("initDelay")) {
            config.initDelay = 250;
        }

        config.pageId = page.model.get("_id");

        model = new Backbone.Model(config);
        _.delay(function () {
            SectionHeadings.initialize(model);
        }, config.initDelay);
    });
});
