define(function (require) {

    var Adapt = require("coreJS/adapt"),
        locked = {},
        handler = function (e) {
            //IF NOT KEY TO BLOCK, RETURN
            if (!locked[e.which]) return;
            console.log("KEY CODE PREVENTED: " + e.which);
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

    $('body').on("keydown", handler);


    //initialize
    Adapt.once('app:dataReady', function () {
        var model = Adapt.config.get('_keyBlocker');
        //console.log("adapt-key-blocker", "dataReady", model);
        if (_.isUndefined(model) || (!_.isUndefined(model) && (model._isEnabled == false || !model.keys))) {
            //dont use it - turned off
            $('body').off("keydown", handler);
            return;
        } else {
            //update keys to lock
            if (model.keys) {
                for (var i = 0, max = model.keys.length; i < max; i++) {
                    locked[model.keys[i]] = true;
                }
            }
            //console.log("adapt-key-blocker", "locked", locked);
        }
    });
});
