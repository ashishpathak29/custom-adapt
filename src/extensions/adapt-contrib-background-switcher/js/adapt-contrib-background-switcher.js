

define([
	'coreJS/adapt'
], function (Adapt) {

    var BackgroundSwitcherView = Backbone.View.extend({

        _blockModels: null,
        _blockModelsIndexed: null,
        _onBlockInview: null,
        $backgroundContainer: null,
        $backgrounds: null,
        $blockElements: null,
        _firstId: null,
        _activeId: null,
        _imageReady: false,
        _pageReady: false,

        initialize: function () {
            console.log("BackgroundSwitcher", "initialize", this.model);
            this._blockModels = this.model.findDescendants('blocks').filter(function (model) {
                return model.get("_backgroundSwitcher");
            });

            console.log("BackgroundSwitcher", "this._blockModels", this._blockModels);
            if (this._blockModels.length == 0) {
                this.onRemove();
                return;
            }
            this._blockModelsIndexed = _.indexBy(this._blockModels, "_id");
            this._imageReady = false;
            this.setupBackgroundContainer();
            this.listenToOnce(Adapt, "pageView:ready", this.onPageReady);
            this.listenToOnce(Adapt, "remove", this.onRemove);
        },

        onPageReady: function () {

            console.log("BackgroundSwitcher", "onPageReady", arguments);
            console.log("BackgroundSwitcher", "this._imageReady", this._imageReady);
            //this._pageReady = true;
            //if (!this._imageReady) {
            //    $(".loading").show();
            //    $("#a11y-focuser").focus();
            //    $("body").attr("aria-hidden", true);
            //}

            this.$blockElements = {};
            this.$backgrounds = {};
            this.callbacks = {};

            //this.$backgroundContainer.imageready(_.bind(this.onBackgroundImagesLoaded, this));

            for (var i = 0, l = this._blockModels.length; i < l; i++) {
                var blockModel = this._blockModels[i];
                if (!blockModel.get('_backgroundSwitcher')) continue;

                var id = blockModel.get("_id");

                if (!this._firstId) this._firstId = id;

                var $blockElement = this.$el.find("." + id);

                $blockElement.attr("data-backgroundswitcher", id);
                this.$blockElements[id] = $blockElement;
                this.callbacks[id] = _.bind(this.onBlockInview, this);
                this.$blockElements[id].on("onscreen", this.callbacks[id]);

                $blockElement.addClass('background-switcher-block');

                var options = blockModel.get('_backgroundSwitcher');

                //Kunj 201602161812
                //Random background
                var _sSrc = options.src, _sMSrc = options.mobileSrc, _aSrc = _sSrc.split(','), _aMSrc = _sMSrc.split(','), _nSrcLen = _aSrc.length, _nRnd = Math.floor(Math.random()*_nSrcLen);
                
                if (_nSrcLen > 1) {
                    var _aUniqueRnd = this.getUniqueRandomNumRange(0, _nSrcLen, _nSrcLen), _sUrl = _aSrc[_aUniqueRnd[_nRnd]], _sMUrl = _aMSrc[_aUniqueRnd[_nRnd]];
                    
                    var $backGround = $('<div class="background-switcher-background" style="background-image: url(' + _sUrl + ');"></div>');
                    this.$backgroundContainer.prepend($backGround);
                    this.$backgrounds[id] = $backGround;

                    $blockElement.find('.block-inner').addClass('background-switcher-block-mobile').css({
                        'background-image': 'url(' + _sMUrl + ')'
                    });
                } else {
                    var $backGround = $('<div class="background-switcher-background" style="background-image: url(' + options.src + ');"></div>');
                    this.$backgroundContainer.prepend($backGround);
                    this.$backgrounds[id] = $backGround;

                    $blockElement.find('.block-inner').addClass('background-switcher-block-mobile').css({
                        'background-image': 'url(' + options.mobileSrc + ')'
                    });
                }
            }

            this._activeId = this._firstId;

            this.showBackground();
        },
        
        getUniqueRandomNumRange: function (start, end, count) {
            var arr = []
            while (arr.length < count) {
                var randomnumber = start + Math.floor(Math.random() * end)
                var found = false;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == randomnumber) {
                        found = true;
                        break
                    }
                }
                if (!found) arr[arr.length] = randomnumber;
            }
            return arr;
        },
        
        setupBackgroundContainer: function () {

            this.$backgroundContainer = $('<div class="background-switcher-container"></div>');
            this.$el.addClass('background-switcher-active');
            this.$el.prepend(this.$backgroundContainer);

        },
        onBackgroundImagesLoaded: function () {
            console.log("BackgroundSwitcher", "onBackgroundImagesLoaded", arguments);
            this._imageReady = true;
            //if (this._pageReady) {
                $(".loading").hide();
                $("body").removeAttr("aria-hidden");
            //}
        },
        onBlockInview: function (event, measurements) {
            var isOnscreen = measurements.percentFromTop < 80 && measurements.percentFromBottom < 80;
            if (!isOnscreen) return;

            var $target = $(event.target);
            var id = $target.attr("data-backgroundswitcher");

            if (this._activeId === id) return;

            this._activeId = id;

            this.showBackground();
        },

        showBackground: function () {
            var blockModel = this._blockModelsIndexed[this._activeId];

            if (Modernizr.csstransitions) {
                $('.background-switcher-background.active').removeClass('active');
                try {
                    this.$backgrounds[this._activeId].addClass('active');
                } catch (e) {}
            } else {
                $('.background-switcher-background.active').animate({
                    opacity: 0
                }, 1000, function () {
                    $(this).removeClass('active');
                });
                this.$backgrounds[this._activeId].animate({
                    opacity: 1
                }, 1000, function () {
                    $(this).addClass('active');
                });
            }
        },

        onRemove: function () {
            console.log("BackgroundSwitcher", "onRemove", this);
            
            for (var id in this.$blockElements) {
                this.$blockElements[id].off("onscreen", this.callbacks[id]);
            }
            this.$blockElements = null;
            this.$backgroundContainer = null;
            this.$backgrounds = null;
            this._blockModels = null;
            this._blockModelsIndexed = null;
            this._onBlockInview = null;
        }


    });

    Adapt.on("pageView:postRender", function (view) {
        var model = view.model;
        if (model.get("_backgroundSwitcher")) {
            if (model.get("_backgroundSwitcher")._isActive) {
                new BackgroundSwitcherView({ model: model, el: view.el });
            }
        }
    });

});
