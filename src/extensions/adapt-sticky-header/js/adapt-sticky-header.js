define(function (require) {
    var TAG = "StickyHeader";
    var Adapt = require('coreJS/adapt'),
        AdaptView = require('coreViews/adaptView'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');
    require('./lib/jquery.ba-throttle-debounce.js');


    var CSS_STICKY_HEADER = "stickyHeader",
        CSS_STICKY_HEADER_WRAP = "stickyHeaderWrap",
        CSS_STICKY_HEADER_BLOCK = "stickyHeaderBlock",
        CSS_STICKY_HEADER_BACKGROUND = "stickyHeaderBackground";
    var StickyHeader = _.extend({
            $window: null,
            $stickyHeaders: null,
            DEBUG: false,
            log: function () {
                if (this.DEBUG == false) return;
                var args = Array.prototype.slice.call(arguments);
                //args.unshift(this.model.get("_id"));
                args.unshift(TAG);


                if(window.console && window.console.log)
                {
                    try {
                       //console.log.apply(console, args);
                    } catch(e) {
                       //console.log(args);
                    }
                }
            },
            emptyRect: {
                'left': 0,
                'top': 0,
                'right': 0,
                'bottom': 0,
                'height': 0,
                'width': 0,
                'originalPosition': 0,
                'originalHeight': 0,
                'originalWidth': 0
            },
            //public
            initialize: function (model) {
                //
                //console.log(TAG, "initialize", this);
                var headers = $("." + CSS_STICKY_HEADER);
                if (headers.length == 0) {
                    //abort
                    this.remove();
                    return;
                }
                //
                this._isRemoved = false;
                this.model = model;
                this.$window = $(window);
                this.topMargin = $('.navigation').height();
                this.removeBinded = _.bind(this.remove, this);
                //Adapt.on('remove', this.removeBinded);
				this.listenTo(Adapt, 'remove', this.removeBinded);
                this.resizeBinded = _.bind(this.onresize, this);
                //Adapt.on('device:resize', this.resizeBinded);
				this.listenTo(Adapt, 'device:resize', this.resizeBinded);
                //
                //console.log(TAG, "initialize(model)", model);
                //console.log(TAG, "this.$window", this.$window);
                //console.log(TAG, "this.topMargin", this.topMargin);
                //
                this.scrolling = $.throttle(this.model.get("throttle"), false, _.bind(this._whenScrolling, this));
                this.afterScroll = $.debounce(this.model.get("throttle") * 2, false, _.bind(this._whenScrolling, this));
                this.wheel = /*$.debounce(this.model.get("throttle") * 2, false, */ _.bind(this._whenScrolling, this) /*)*/ ;
                //Adapt.on('page:scrolledTo', this.afterScroll);
				this.listenTo(Adapt, 'page:scrolledTo', this.afterScroll);
                //
                //
                this.load(headers);
            },
            //private
            load: function (headers) {
                if (this._isRemoved) return;
                this.log("load", headers);
                if (typeof headers === "object" && headers instanceof jQuery && headers.length > 0) {




                    this.$stickyHeaders = headers.each(function () {

                        var $wrapper = $('<div class="' + CSS_STICKY_HEADER_WRAP + '" />');
                        var $background = $('<div class="' + CSS_STICKY_HEADER_BACKGROUND + '" />');
                        var $header = $(this);
                        var $block = $header.closest("." + CSS_STICKY_HEADER_BLOCK);
                        //var classes = $header.attr("class");
                        //    $wrapper.addClass(classes); //copy classes of wrapped header, remove the class that makes it header
                        //    $wrapper.removeClass(CSS_STICKY_HEADER);

                        $header.wrap($wrapper).append($background);
                        var blockHeight = $block.outerHeight();
                        $header
                            .data('originalPosition', $header.offset().top)
                            .data('originalHeight', $header.outerHeight())
                            .data('originalWidth', $header.outerWidth())
                            .data('blockHeight', blockHeight)
                            .parent()
                            .height(blockHeight);
                        //
                        $background.height($header.outerHeight());

                    });

                    this.$window.off("scroll.sticky-header")
                        .on("scroll.sticky-header", this.scrolling)
                        .on("scroll.sticky-header", this.afterScroll)
                        .off("wheel mousewheel.sticky-header")
                        .on("wheel mousewheel.sticky-header", this.wheel);

                    this.scrolling();
                }
            },
            getStickyHeaderRect: function (sticky) {
                if (!sticky || sticky.length == 0) return this.emptyRect;
                var r = sticky[0].getBoundingClientRect(),
                    rect = {
                        left: r.left,
                        top: r.top,
                        right: r.right,
                        bottom: r.bottom,
                        height: r.height,
                        width: r.width,
                        originalPosition: sticky.data('originalPosition'),
                        originalHeight: sticky.data('originalHeight'),
                        originalWidth: sticky.data('originalWidth')
                    };
                return rect;
            },
            _whenScrolling: function () {
                this.log("_whenScrolling", arguments);
                var that = this,
                    tm = this.topMargin,
                    scrollTopMin = that.$window.scrollTop() - tm,
                    scrollTopMax = that.$window.scrollTop() + tm;


                var i = this.$stickyHeaders.length;
                while (i--) {

                    //this.$stickyHeaders.each(function (i) {

                    var $prevHeader = i > 0 ? that.$stickyHeaders.eq(i - 1) : {
                            length: 0
                        },
                        $thisHeader = /*$(this)*/ $(this.$stickyHeaders[i]),
                        $thisBackground = $thisHeader.find("." + CSS_STICKY_HEADER_BACKGROUND),
                        $thisBlock = $thisHeader.closest("." + CSS_STICKY_HEADER_BLOCK),
                        $nextHeader = that.$stickyHeaders.eq(i + 1),
                        rect = that.getStickyHeaderRect($thisHeader),
                        bgHeight = $thisBackground.outerHeight();


                    this.log(i);

                    if (rect.originalPosition <= scrollTopMax) {
                        $thisBlock.addClass("fixed");
                        $thisHeader.addClass("fixed")
                            .css('width', rect.originalWidth);
                        $thisHeader.parent().css('height', $thisHeader.data('blockHeight'));
                        
                        var rectBg = that.getStickyHeaderRect($thisBackground);
                        
                        this.log(i, rect, rectBg);


                        if ($nextHeader.length > 0) {
                            //adjust offset
                            var $nextBackground = $nextHeader.find("." + CSS_STICKY_HEADER_BACKGROUND),
                                nRect = that.getStickyHeaderRect($nextHeader),
                                nBgHeight = $nextBackground.outerHeight();
                            this.log("nRect.top", nRect.top, "rect.bottom", rect.bottom, bgHeight, rect.top+bgHeight);
                            if (nRect.top <= rect.top+bgHeight) {

                                $thisHeader.css('top', nRect.top - bgHeight);
                                $thisBackground.css('top', nRect.top - bgHeight);
                            } else {
                                $thisHeader.css('top', tm);
                                $thisBackground.css('top', tm);
                            }
                        } else {
                            $thisHeader.css('top', tm);
                            $thisBackground.css('top', tm);
                        }

                    } else {
                        $thisBlock.removeClass("fixed");
                        $thisHeader.removeClass("fixed")
                            .css('top', '')
                            .css('width', '');
                        $thisBackground.css('top', '');
                        $thisHeader.parent().css('height', '');//remove height so it does not blow the block height
                    }

                }
                //)
                ;
            },
            onresize: function () {
                this.log("onresize", arguments);
                if (this._isRemoved) return;
                clearTimeout(this._resizeDelayId);
                this.clear();
                this.load($("." + CSS_STICKY_HEADER));
                this._resizeDelayId = _.delay(_.bind(function () {
                    this.scrolling();
                }, this), 100);
            },
            clear: function () {
                this.log("clear");
                if (this._isRemoved) return;

                if (this.$window) {

                    this.$window.off("scroll.sticky-header")
                        .off("wheel mousewheel.sticky-header");
                }

                if (this.$stickyHeaders) {
                    this.$stickyHeaders.each(function (i) {
                        var $thisHeader = $(this);

                        $thisHeader.removeData('originalPosition')
                            .removeData('originalHeight')
                            .removeData('originalWidth')
                            .removeData('blockHeight')
                            .removeClass("fixed");

                        $thisHeader.find("." + CSS_STICKY_HEADER_BACKGROUND).remove();

                        if ($thisHeader.parent().is("." + CSS_STICKY_HEADER_WRAP)) {
                            $thisHeader.unwrap();
                        }
                    });
                }
            },
            remove: function () {
                this.log("remove", this);
                if (this._isRemoved) return;
				/*
                Adapt.off('remove', this.removeBinded)
                    .off('device:resize', this.resizeBinded)
                    .off('page:scrolledTo', this.afterScroll);
				*/
				this.stopListening();
                this.clear();

                clearTimeout(this._resizeDelayId);
                this.scrolling = undefined;
                this.afterScroll = undefined;
                this.wheel = undefined;
                this.$window = undefined;
                this.$stickyHeaders = undefined;
                this.model = undefined;
                this.topMargin = undefined;
                this.resizeBinded = undefined;
                this.removeBinded = undefined;


                //last thing:)
                this._isRemoved = true;
            }
        },
        Backbone.Events);

    var mergeConfigs = function (base, config) {

        var existBase = !_.isUndefined(base);
        var existConfig = !_.isUndefined(config);

        if (existBase && !existConfig) return base;
        if (!existBase && existConfig) return config;
        if (!existBase && !existConfig) return {};

        //copy
        var newConfig = {};
        if (base.hasOwnProperty("_isEnabled")) newConfig._isEnabled = base._isEnabled;
        if (base.hasOwnProperty("throttle")) newConfig.throttle = base.throttle;
        if (base.hasOwnProperty("initDelay")) newConfig.initDelay = base.initDelay;

        //merge
        if (config.hasOwnProperty("_isEnabled")) newConfig._isEnabled = config._isEnabled;
        if (config.hasOwnProperty("throttle")) newConfig.throttle = config.throttle;
        if (config.hasOwnProperty("initDelay")) newConfig.initDelay = config.initDelay;

        return newConfig;
    }
    Adapt.on('pageView:ready', function (page) {

        var config = mergeConfigs(Adapt.config.get('_stickyHeader'), page.model.get('_stickyHeader'));
        //console.log(TAG, "page post ready", page.model.get("_id"), config);
        //console.log(TAG, "_.isUndefined(config)", _.isUndefined(config));
        //console.log(TAG, "config._isEnabled", config._isEnabled);

        if (!_.isUndefined(config) && config._isEnabled == false) {
            //dont use it - turned off
            return;
        }

        if (!config.hasOwnProperty("throttle")) config.throttle = 150;
        if (!config.hasOwnProperty("initDelay")) config.initDelay = 100;

        config.pageId = page.model.get("_id");

        var model = new Backbone.Model(config);
        //console.log(TAG, "model", model);
        _.delay(function () {
            StickyHeader.initialize(model);
        }, config.initDelay);
    });
});
