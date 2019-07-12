define(function (require) {

    var Adapt = require("coreJS/adapt"),
        Backbone = require('backbone');
    var scorm;

    var handlersCopy;
    var init = function () {
//        console.log("AlternativeStart", "app:dataReady");
        //just once
        Adapt.off("app:dataReady", init);


        var spoorConfig = Adapt.config.get('_spoor');
        if (!spoorConfig || spoorConfig._isEnabled === false) {
            //disable spoor
            scorm = {
                lmsConnected: false,
                isFirstSession: function () {
                    return true;
                }
            };
        } else {
            scorm = require('extensions/adapt-contrib-spoor/js/scorm');
        }


        var config = Adapt.config.get("_alternativeStart");

        if (_.isUndefined(config) || !config._isEnabled) return;
        if (_.isUndefined(config.firstTimeId) && _.isUndefined(config.returningId)) return;



        handlersCopy = Backbone.history.handlers;
        Backbone.history.handlers = [];

        Adapt.on("adapt:initialize", adaptInitialized);
    };
    var adaptInitialized = function () {

//        console.log("AlternativeStart", "adaptInitialized");
//        console.log("AlternativeStart", "Backbone.history", Backbone.history);
        //just once
        Adapt.off("adapt:initialize", adaptInitialized);

        Backbone.history.handlers = handlersCopy;

        var config = Adapt.config.get("_alternativeStart");
        //if one is missing the other is copied
        if (_.isUndefined(config.firstTimeId)) config.firstTimeId = config.returningId;
        if (_.isUndefined(config.returningId)) config.returningId = config.firstTimeId;
        //
//        console.log("AlternativeStart", "1 - Adapt.location", Adapt.location);

        //
        var nav = {
            trigger: true,
            replace: false
        };
        var path = "#/id/";
        var isDefault = false;
        if (_.indexOf(window.location.href, "#") == -1) {
            var isFirstTime = !scorm.lmsConnected || scorm.isFirstSession();
            if (isFirstTime) {
                if (config.firstTimeId == "") {
                    path = "#/"; //if empty go to menu as usual
                    nav.replace = true;
                    isDefault = true;
                } else {
                    path += config.firstTimeId;
                }
            } else {
                if (config.returningId == "") {
                    path = "#/"; //if empty go to menu as usual
                    nav.replace = true;
                    isDefault = true;
                } else {
                    path += config.returningId;
                }
            }
        } else {
            isDefault = true;
            //we are not going into default -menu- location so do as default
            path = window.location.hash == "" ? "#/" : window.location.hash;
            nav.replace = true;
        }
        //
//
//        console.log("AlternativeStart", "scorm.isFirstSession", scorm.isFirstSession());
//        console.log("AlternativeStart", "isFirstTime", isFirstTime);
//        console.log("AlternativeStart", "config", config);
//        console.log("AlternativeStart", "path", path);
        //
        Backbone.history.navigate(path, nav);
//        console.log("AlternativeStart", "2 - Adapt.location", Adapt.location);
        if (!isDefault) {
            Adapt.once('pageView:ready', function () {
                _.defer(_.bind(function () {
                    //reset as it was alternative path
                    /*
                    var cid = Adapt.location._currentId;
                    Adapt.location = {
                        _contentType: undefined,
                        _currentId: cid,
                        _currentLocation: undefined,
                        _lastVisitedPage: undefined,
                        _lastVisitedType: undefined,
                        _previousContentType: undefined,
                        _previousId: undefined
                    };
					/*/
                    Adapt.location = _.extend(Adapt.location, {
                        _contentType: 'page',
                        _currentLocation: undefined,
                        _lastVisitedPage: undefined,
                        _lastVisitedType: undefined,
                        _previousContentType: undefined,
                        _previousId: undefined
                    }); 
                    //*/                   
                   //console.log("AlternativeStart", "3 - Adapt.location", Adapt.location);

                }, this))
            });
        }
    };

    //start
    Adapt.on("app:dataReady", init);
});
