/*
After page is created and rendered
Scan for the blocks and pick all that are marked as subtopic's
If there is more than 0 create a subtopic-menu and populate it
*/
define(function (require) {

    var Adapt = require('coreJS/adapt'),
        AdaptView = require('coreViews/adaptView'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        TAG = "NavButtons",
        ACTION_PREVIOUS = "prev",
        ACTION_NEXT = "next";
    require('./lib/jquery.ba-throttle-debounce.js');


    var NavButtons = AdaptView.extend({
        className: "nav-buttons-container",

        _isScrolling: false,
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
        initialize: function () {


            this._applyDefaults();
            this._delayedWhenScrollingID = -1;
            this._isScrolling = false;
            this.history = {
                previous: -1,
                current: 0,
                next: -1
            };
            this.stickyHeaderHeight = -1;
            this.useSticky = false;

            this.$window = $(window);
            this.topMargin = $('.navigation').height();

            this.ie8 = $('html').hasClass('ie8');

            var pageModel = Adapt.findById(this.model.get('pageId'));
            if (pageModel) {

                var sh = Adapt.config.get('_stickyHeader');

                if (!sh || sh._isEnabled) {
                    //no global settings or it allows sticky
                    sh = pageModel.get('_stickyHeader');

                    if (!sh || sh._isEnabled == false) {
                        this.useSticky = false;
                    } else {
                        this.useSticky = sh._isEnabled;
                    }
                }


                var descendant = this.model.get('descendant');
                //get children and scan for details
                var pageDescendant = pageModel.findDescendants(descendant);
                var filtered = this._filteredDescendants = pageDescendant.filter(_.bind(function (model) {
                    var o = model.get("_navButtons");
                    if (o && !o.hasOwnProperty("_isEnabled")) {
                        o._isEnabled = true; //defaults
                    }

                    return !o || o && o._isEnabled;

                }, this));

                this.debouncedResize = $.debounce(333, false, _.bind(function () {
                    this._filterItems();
                    this._whenScrolling();
                }, this));

                this.debouncedUpdateButtons = _.debounce(this.updateButtons, 350);

                if (filtered.length == 0) {
                    this.remove();
                    return;
                } else {
                    this.listenTo(Adapt, "device:resize", this.setup);

                    this.listenTo(Adapt.components, "change:" + "_isComplete", this.onAnyComplete);
                    this.listenTo(Adapt, "componentView:postRender", this.assessmentRendered);

                    this._filteredDescendantModels = [];

                    this._descendantIds = "";
                    _.each(this._filteredDescendants, _.bind(function (model) {
                        
                        if (model.get("_pageLevelProgress")._isEnabled || model.get("_component")  == 'go-next') {
                            var id = "." + model.get("_id");
                            this._descendantIds += id + ",";
                            this._filteredDescendantModels.push(model);
                        }

                    }, this));
                    this._descendantIds = this._descendantIds.slice(0, -1); //remove last comma


                    this.$filteredDescendants = $(this._descendantIds);

                    //
                    this.whenScrollingBinded = _.bind(this._whenScrolling, this);
                    this.scrolling = $.throttle(this.model.get("throttle"), false, this.whenScrollingBinded);
                    this.afterScroll = $.debounce(this.model.get("throttle") * 2, false, this.whenScrollingBinded);
                    this.wheel = /*$.debounce(this.model.get("throttle") * 2, false, */ this.whenScrollingBinded /*)*/;
                    //this._afterWhenScrollingBinded = _.bind(this._afterWhenScrolling, this);
                    //this.listenTo(Adapt, 'page:scrolledTo', this._afterWhenScrolling);


                    this.triggerEventBinded = _.bind(this.triggerEvent, this);
                    Adapt.on("nav-buttons:action", this.triggerEventBinded);

                    this.$window.off("scroll.nav-buttons")
                        .on("scroll.nav-buttons", this.scrolling)
                        .on("scroll.nav-buttons", this.afterScroll)
                        .off("wheel mousewheel.nav-buttons")
                        .on("wheel mousewheel.nav-buttons", this.wheel);

                    //cache sticky headers
                    this.cacheStickyHeader = $('.stickyHeader');
                    this.cacheStickyHeaderBackground = $('.stickyHeaderBackground');
                    this.cacheStickyHeaderBlock = $('.stickyHeaderBlock');
                    this.setup();
                    //this.updateButtons();
                    this.lockButtons();
                    this.debouncedUpdateButtons();
                }
            } else {
                this.remove();
                return;
            }
            //
            AdaptView.prototype.initialize.call(this);
            //
        },

        setup: function () {
            if (this._isRemoved) return;
            this.topMargin = $('.navigation').height();
            this._refreshStickyHeaderHeight();
            this.debouncedResize();
        },

        render: function () {
            if (this._isRemoved) return;

            var template = Handlebars.templates[this.constructor.template];

            var data = this.model.toJSON();
            this.$el.html(template(data))
                .appendTo('#wrapper');



            _.delay(_.bind(function () {
                if (this._isRemoved) return;
                this.postRender();
                this._afterWhenScrolling();

                this.setReadyStatus();
                //this.updateButtons();
                this.lockButtons();
                this.debouncedUpdateButtons();
            }, this), 633);


            return this;
        },
        /**
         * Destroys view and it's children
         */
        remove: function () {
            if (this._isRemoved) return;
            this._isRemoved = true;
            this.model.set('_isReady', false);


            var ch = this.model.get("_children");

            if (ch) ch.reset();

            ch = undefined;
            //$(this._descendantIds).off('inview', this.onChildInviewBinded);

            this._isScrolling = false;

            this.stopListening(Adapt, "device:resize", this.setup);
            this.stopListening(Adapt, 'remove', this.remove);

            this.stopListening(Adapt, 'page:scrolledTo', this._afterWhenScrolling);
            //Adapt.off('page:scrolledTo', this._afterWhenScrollingBinded);
            this.stopListening();

            if (this.$window) {

                this.$window.off("scroll.nav-buttons")
                    .off("wheel mousewheel.nav-buttons");
                this.$window = undefined;
            }
            Adapt.off("nav-buttons:action", this.triggerEventBinded);


            this._afterWhenScrollingBinded = undefined;
            this.triggerEventBinded = undefined;
            this.scrolling = undefined;
            this.afterScroll = undefined;
            this.wheel = undefined;
            this.whenScrollingBinded = undefined;
            this.debouncedResize = undefined;

            this.$filteredDescendants = undefined;
            this._filteredDescendants = undefined;
            this._filteredDescendantModels = undefined;
            this.cacheStickyHeader = undefined;
            this.cacheStickyHeaderBackground = undefined;
            this.cacheStickyHeaderBlock = undefined;


            this._descendantIds = undefined;
            this.history = undefined;

            this.$el.remove();

            this.el = undefined;
            this.$el = undefined;

            this.model.destroy();
            return this;
        },
        /**
         * Adds children for this view
         */
        addChildren: function () {
            if (this._isRemoved) return;
            var childrenCollection = new Backbone.Collection();

            var data = this.model.get("items");
            for (var i = 0, max = data.length; i < max; i++) {

                if (!data[i].hasOwnProperty("_isEnabled")) data[i]._isEnabled = true;

                var m = new Backbone.Model(data[i]);
                m.set("_nthChild", i);
                var $parentContainer = this.$(this.constructor.childContainer);
                var view = new NavButtonsItemView({
                    model: m
                });
                $parentContainer.append(view.$el);
                childrenCollection.add({
                    model: m,
                    view: view
                });
            }

            this.model.set("_children", childrenCollection);
        },
        triggerEvent: function (btnModel) {
            if (this._isRemoved) return;
            //event.preventDefault();


            if (!btnModel || this._isScrolling) return;
            var action = btnModel.get("action") || ACTION_NEXT,
                prevmodel = this._filteredDescendantModels[this.history.previous],
                model = this._filteredDescendantModels[this.history.current],
                nextmodel = this._filteredDescendantModels[this.history.next],
                o = model.get("_navButtons"),
                id,
                useNavTo = false,
                gapModel,
                gap = this._getGap();
            console.log("NavButtons", "triggerEvent", nextmodel);
            if (action.toLowerCase() === ACTION_NEXT) {
                id = nextmodel ? nextmodel.get("_id") : undefined;
                if (o && o.hasOwnProperty("_gotoNext")) {
                    id = o._gotoNext;
                    useNavTo = true;
                }
                gapModel = nextmodel && nextmodel.has("_navButtons") ? nextmodel.get("_navButtons") : undefined;
                if (gapModel && gapModel.hasOwnProperty("_gap")) {
                    gap = this._getGap(gapModel._gap);
                }
            } else if (action.toLowerCase() === ACTION_PREVIOUS) {
                id = prevmodel ? prevmodel.get("_id") : undefined;
                if (o && o.hasOwnProperty("_gotoPrev")) {
                    id = o._gotoPrev;
                    useNavTo = true;
                }
                gapModel = prevmodel && prevmodel.has("_navButtons") ? prevmodel.get("_navButtons") : undefined;
                if (gapModel && gapModel.hasOwnProperty("_gap")) {
                    gap = this._getGap(gapModel._gap);
                }

            }
            console.log("NavButtons", "triggerEvent", "id", id, "o", o, "this.history", this.history);
            if (id) {
                var options = {
                    duration: 500,
                    offset: {
                        top: -(this.topMargin + this.stickyHeaderHeight + gap)
                    }
                };
                if (useNavTo) {
                    this.lockButtons();
                    if (action.toLowerCase() === ACTION_PREVIOUS) { options.duration = 0; }
                    Adapt.navigateToElement(id, options);
                    return;
                }
                //
                this._isScrolling = true;

                //
                Adapt.trigger("trickle:onClick", true);
                //
                var a = this.listenToOnce(Adapt, 'page:scrolledTo', this._afterWhenScrolling);


                this.lockButtons();
                _.delay(_.bind(function () {
                    Adapt.scrollTo("." + id, options);
                }, this), 333);


            }

        },
        _getGap: function (c) {
            console.log("NavButtons", "_getGap", c);
            var config = c ? c : this.model.get('gap');

            if (config) {
                if (typeof config == "number") {
                    return config;
                } else {
                    //object
                    /*
                    "small": 520,
                    "medium": 800,
                    "large": 980
                    */
                    //TRICKY: this this.$window.width() may return th width with or without scrollbars
                    //
                    //if(config.hasOwnProperty('saba') && (this.$window.width() == 800 || this.$window.width() == 784) &&  this.$window.height() == 500) {
                    //Kunj: Chrome and IE fix
                    if (this.ie8 && (this.$window.width() >= 782 || this.$window.width() <= 800) && this.$window.height() == 500) {
                        if (config.hasOwnProperty('saba')) {
                            return config.saba || 0;
                        }
                    }


                    switch (Adapt.device.screenSize) {
                        case "small":
                            return config.small || 0;
                            break;
                        case "medium":
                            return config.medium || 0;
                            break;
                        case "large":
                            return config.large || 0;
                            break;
                    }
                }
            }

            return 0;
        },
        _afterWhenScrolling: function () {
            if (this._isRemoved) return;
            clearTimeout(this._delayedWhenScrollingID);
            this._delayedWhenScrolling();
        },
        _delayedWhenScrolling: function () {
            this._delayedWhenScrollingID = setTimeout(_.bind(function () {

                this._whenScrolling();
                this._isScrolling = false;

            }, this), 200);
        },
        /**
         * Event handler called on scrolling
         */
        _whenScrolling2: function () {
            if (this._isRemoved) return;

            //this.updateButtons();
            //this.lockButtons();
            this.debouncedUpdateButtons();
        },
        _whenScrolling: function () {
            if (this._isRemoved) return;

            this._refreshStickyHeaderHeight();

            var that = this,
                tm = this.topMargin,
                gap = this._getGap(),
                topOffset = tm + this.stickyHeaderHeight,
                scrollTopMax = that.$window.scrollTop() + topOffset + gap,
                wHeight = that.$window.height(),
                wHeightHalf = wHeight / 2,
                wWidth = that.$window.width();


            //var i = this.$filteredDescendants.length;
            var i = -1;
            //while (i--) {//backward
            while (i++ < this.$filteredDescendants.length) {

                //this.$filteredDescendants.each(function (i) {

                var $prevItem = i > 0 ? that.$filteredDescendants.eq(i - 1) : {
                    length: 0
                },
                    $thisItem = /*$(this)*/ $(this.$filteredDescendants[i]),
                    $nextItem = that.$filteredDescendants.eq(i + 1),
                    rect = that._getRect($thisItem);


                //if (that._filteredDescendantModels[i].get("_isEnabled") == false || that._filteredDescendantModels[i].get("_isVisible") == false) continue;


                if (rect.top >= topOffset || (rect.top <= topOffset && rect.bottom > wHeightHalf) || (rect.top >= topOffset && rect.bottom < wHeightHalf)) {
                    //current


                    this.history.previous = i - 1;

                    //skip over if disabled
                    while (that.history.previous >= 0 &&
                        (that._filteredDescendantModels[that.history.previous] &&
                            that._filteredDescendantModels[that.history.previous].get("_isEnabled") == false &&
                            that._filteredDescendantModels[that.history.previous].get("_isVisible") == false)) {
                        that.history.previous -= 1;
                    }


                    this.history.current = i;

                    this.history.next = i + 1;

                    //skip over if disabled
                    while (that.history.next < that._filteredDescendantModels.length &&
                        (that._filteredDescendantModels[that.history.next] &&
                            that._filteredDescendantModels[that.history.next].get("_isEnabled") == false &&
                            that._filteredDescendantModels[that.history.next].get("_isVisible") == false)) {
                        that.history.next += 1;
                    }
                    if (that.history.next == that._filteredDescendantModels.length) {
                        this.history.next = -1
                    }



                    //or next is the go-next

                    if (!$nextItem || $nextItem.length == 0 || $nextItem.length > 0 && that._getRect($nextItem).height == 0) {
                        this.history.next = -1;
                    }
                    if (!$prevItem || $prevItem.length == 0 || $prevItem.length > 0 && that._getRect($prevItem).height == 0) {
                        this.history.previous = -1;
                    }

                    //we've matched current - stop
                    break;
                }


            }
            //this.updateButtons();
            //this.lockButtons();
            this.debouncedUpdateButtons();
        },


        onAnyComplete: function (model, value, isPerformingCompletionQueue) {
            if (value === true) {
                this._whenScrolling();
            }
        },
        assessmentRendered: function () {
            this._whenScrolling();
        },
        _filterItems: function () {
            var pageModel = Adapt.findById(this.model.get('pageId'));
            if (pageModel) {
                var descendant = this.model.get('descendant');
                //get children and scan for details
                var pageDescendant = pageModel.findDescendants(descendant);
                var filtered = this._filteredDescendants = pageDescendant.filter(_.bind(function (model) {
                    var o = model.get("_navButtons");
                    if (o && !o.hasOwnProperty("_isEnabled")) {
                        o._isEnabled = true; //defaults
                    }
                    return !o || o && o._isEnabled;

                }, this));


                if (filtered.length == 0) {

                    this.history = {
                        previous: -1,
                        current: -1,
                        next: -1
                    };

                } else {

                    this._filteredDescendantModels = [];

                    this._descendantIds = "";
                    _.each(this._filteredDescendants, _.bind(function (model) {
                        
                         if (model.get("_pageLevelProgress")._isEnabled || model.get("_component")  == 'go-next') {
                            var id = "." + model.get("_id");
                            this._descendantIds += id + ",";

                            this._filteredDescendantModels.push(model);
                         }
                        

                        

                    }, this));
                    this._descendantIds = this._descendantIds.slice(0, -1); //remove last comma
                    //
                    this.$filteredDescendants = $(this._descendantIds);
                }
            }
        },
        lockButtons: function () {
            if (this._isRemoved) return;
            var ch = this.model.get("_children");
            if (ch) {
                ch.each(_.bind(function (model, index) {
                    var m = model.get("model");

                    m.set("_isEnabled", false);
                }, this));
            }
        },
        updateButtons: function () {
            if (this._isRemoved) return;
            var ch = this.model.get("_children");
            console.log("NavButtons", "updateButtons");
            if (ch) {
                ch.each(_.bind(function (model, index) {
                    var m = model.get("model"),
                        currentModel = this._filteredDescendantModels[this.history.current],
                        o = currentModel.get("_navButtons");
                    //console.log("NavButtons", "each#", index, "m", m, "currentModel", currentModel, "o", o, "this.history", this.history);
                    if (m && m.get("action") == ACTION_PREVIOUS) {
                        if (this.history.previous == -1) {
                            m.set("_isEnabled", false);

                            if (o && o.hasOwnProperty("_gotoPrev")) {

                                m.set("_isEnabled", true);
                            }
                        } else {
                            m.set("_isEnabled", true);
                        }
                    }
                    if (m && m.get("action") == ACTION_NEXT) {
                        if (this.history.next == -1) {
                            m.set("_isEnabled", false);

                            if (o && o.hasOwnProperty("_gotoNext")) {

                                m.set("_isEnabled", true);
                            }
                        } else {
                            m.set("_isEnabled", true);
                        }
                        //if current not complete - locate next
                        if (currentModel && currentModel.get("_isComplete") == false) {
                            m.set("_isEnabled", false);
                        }
                    }

                }, this));
            }
        },
        /**
         * Called during initialization to fill the gaps in the model
         */
        _applyDefaults: function () {
            if (this._isRemoved) return;
            if (!this.model.has('descendant')) {
                this.model.set('descendant', 'components');
            }
            if (this.model.get('descendant') == 'components') {
                this.model.set('_childType', 'component');
            }
            if (this.model.get('descendant') == 'blocks') {
                this.model.set('_childType', 'block');
            }
            if (!this.model.has('throttle')) {
                this.model.set('throttle', 333);
            }
            if (!this.model.has('gap')) {
                this.model.set('gap', 30);
            }
        },
        /**
         * Utility method that returns a rect object with dimension of the '*-container' div that wraps this $elem
         */
        _getRect: function ($elem) {
            if (!$elem || $elem.length == 0) return this.emptyRect;
            var childType = this.model.get('_childType');
            var $container = $elem.closest('.' + childType + '-container');
            if (!$container || $container.length == 0) return this.emptyRect;
            var r = $container[0].getBoundingClientRect(),
                rect = {
                    left: r.left,
                    top: r.top,
                    right: r.right,
                    bottom: r.bottom,
                    height: r.height,
                    width: r.width
                };
            return rect;
        },

        _refreshStickyHeaderHeight: function () {
            if (this._isRemoved) return;
            this.stickyHeaderHeight = this.useSticky ? Math.max(this.cacheStickyHeader.outerHeight(),
                this.cacheStickyHeaderBackground.outerHeight(),
                this.cacheStickyHeaderBlock.outerHeight()
            ) : 0;
        }

    }, {
        template: "nav-buttons",
        childContainer: ".nav-buttons-container-inner"
    });

    var NavButtonsItemView = AdaptView.extend({
        tagName: 'a',
        attributes: {
            href: '#'
        },
        className: function () {
            var nth = this.model.get("_nthChild");
            return [
                'nav-buttons-item',
                'nav-buttons-item-' + nth,
                (nth % 2 === 0) ? 'nth-child-even' : 'nth-child-odd'
            ].join(' ');
        },

        events: {
            'click': 'triggerEvent'
        },
        initialize: function () {

            this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);

            if (!this.model.get("_isEnabled")) {
                this.$el.addClass('nav-buttons-disabled');
            }

            AdaptView.prototype.initialize.call(this);
        },

        onEnabledChanged: function () {
            if (!this.model.get("_isEnabled")) {
                this.$el.addClass('nav-buttons-disabled');
            } else {
                this.$el.removeClass('nav-buttons-disabled');
            }
        },

        render: function () {
            var template = Handlebars.templates[this.constructor.template];

            var data = this.model.toJSON();
            this.$el.html(template(data));


            _.defer(_.bind(function () {
                if (this._isRemoved) return;
                this.postRender();
            }, this));


            return this;
        },
        addChildren: function () { /* hide default behaviour */ },
        remove: function () {
            if (this._isRemoved) return;
            this._isRemoved = true;
            this.model.set('_isReady', false);
            this.$el.remove();
            this.stopListening();
            return this;
        },
        triggerEvent: function (event) {
            event.preventDefault();
            if (!this.model.get("_isEnabled")) return;
            Adapt.trigger("nav-buttons:action", this.model);
        }

    }, {
        template: "nav-buttons-item"
    });





    var mergeConfigs = function (base, config) {

        var existBase = !_.isUndefined(base);
        var existConfig = !_.isUndefined(config);

        if (existBase && !existConfig) return base;
        if (!existBase && existConfig) return config;
        if (!existBase && !existConfig) return {};

        //copy
        var newConfig = {};
        if (base.hasOwnProperty("_isEnabled")) newConfig._isEnabled = base._isEnabled;
        //if (base.hasOwnProperty("throttle")) newConfig.throttle = base.throttle;
        //if (base.hasOwnProperty("initDelay")) newConfig.initDelay = base.initDelay;

        //merge
        if (config.hasOwnProperty("_isEnabled")) newConfig._isEnabled = config._isEnabled;
        //if (config.hasOwnProperty("throttle")) newConfig.throttle = config.throttle;
        //if (config.hasOwnProperty("initDelay")) newConfig.initDelay = config.initDelay;

        return newConfig;
    }

    Adapt.on('pageView:ready', function (page) {
        var config = mergeConfigs(Adapt.config.get('_navButtons'), page.model.get('_navButtons'));

        if (!_.isUndefined(config) && config._isEnabled == false) {
            //dont use it - turned off
            return;
        }

        if (!config.hasOwnProperty('gap')) config.gap = 30;
        //if (!config.hasOwnProperty("initDelay")) config.initDelay = 100;

        config.pageId = page.model.get("_id");

        var model = new Backbone.Model(config);

        new NavButtons({
            model: model
        });
    });
});
