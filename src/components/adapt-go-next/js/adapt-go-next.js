define(["coreViews/componentView", "coreJS/adapt"], function (ComponentView, Adapt) {

    var GoNext = ComponentView.extend({

        DEBUG: false,
        log: function () {
            if (this.DEBUG == false) return;
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this.model.get("_id"));
            args.unshift("GoNext");
            if(window.console && window.console.log)
            {
                try {
                   //console.log.apply(console, args);
                } catch(e) {
                   //console.log(args);
                }
            }
        },

        events: {
            'click .go-next-button': 'handleClick'
        },

        preRender: function () {
            // Checks to see if the component should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        postRender: function () {
            this.log("rendering");

            var page = this.getParentModel(this.model, "page");
            if (page) {
                // 1. check if page is complete
                this.log("page id", page.get("_id"));
                var complete = page.get("_isComplete");
                if (!complete) {
                    //incomplete
                    // 3. hide if not complete and listen for completion
                    //hide
                    this.$el.addClass("go-next-hidden");
                    //listen
                    this.listenTo(Adapt, "remove", this.onRemove);
                    this.listenTo(page, "change:_isComplete", this.handlePageComplete);
                }

            }



            // IMPORTANT! 
            // Both of the following methods need to be called inside your view.
            // Use this to set the model status to ready. 
            // It should be used when telling Adapt that this view is completely loaded.
            // This is sometimes used in conjunction with imageReady.
            this.setReadyStatus();

            // Use this to set the model status to complete.
            // This can be used with inview or when the model is set to complete/the question has been answered.
            this.setCompletionStatus();
        },

        // Used to check if the component should reset on revisit
        checkIfResetOnRevisit: function () {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled then state and model attributes should be reset to default.
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        handleClick: function (e) {
            this.log("handleClick", e);
            this.log("_navigateTo", this.model.get('_navigateTo'));

            var id = this.model.get('_navigateTo');
            if(id !== "menu") {
                this.navigateToElement(id, {
                    trigger: true,
                    replace: false
                });
            } else {
                Adapt.trigger('navigation:homeButton');
            }

            e.preventDefault();
        },
        handlePageComplete: function (model, value, isPerformingCompletionQueue) {
            this.log("handlePageComplete", arguments);
            if (value) {
                this.showComponent();
            }
        },
        onRemove: function () {
            //listen
            this.stopListening(Adapt, "remove", this.onRemove);
            var page = this.getParentModel(this.model, "page");
            if (page) {
                this.stopListening(page, "change:_isComplete", this.handlePageComplete);
            }
            this.$el.remove();
            this.stopListening();
            //console.log("onRemove", this);
        },
        showComponent: function () {

            //hide
            this.$el.removeClass("go-next-hidden");
            //
            Adapt.trigger("device:resize");
        },
        /**
         * Utils:
         * Returns the model's parent object id based on the type ("block", "article", "page", "course")
         */
        getParentId: function (model, type) {
            //console.log(this.getTag(), "getParentId", type);
            return this.getParentModel(model, type).get("_id");
        },
        /**
         * Utils:
         * Returns the model's parent object model based on the type ("block", "article", "page", "course")
         */
        getParentModel: function (model, type) {
            //console.log(this.getTag(), "getParentModel", type);
            if (typeof type === "undefined" || type == "") {
                type = "course";
            }
            if (model.get("_type") === type)
                return model;

            var parentModel = model;
            var m;
            var iteration = 0;
            while (parentModel != null) {
                parentModel = parentModel.getParent();
                //console.log(this.getTag(), iteration, "parentModel", parentModel);

                if (parentModel.get("_type") === type) {
                    m = parentModel;
                    break;
                }
                //iteration++;
            }
            return m;
        },
        navigateToElement: function (selector, navSettings, settings) {
            console.log("GoNext", "navigateToElement", arguments);
            //fallback to default functionality as we do not use the back in navigation, just menu which is new feature
            //Adapt.navigateToElement(selector, navSettings, settings);
            //return;
            
            
            
            
            // Allows a selector to be passed in and Adapt will navigate to this element
            // Setup settings object
            var settings = (settings || {});
            var navSettings = (navSettings || {
                trigger: true,
                replace: false
            });

            // Removes . symbol from the selector to find the model
            var currentModelId = selector.replace(/\./g, '');
            var currentModel = Adapt.findById(currentModelId);
            // Get current page to check whether this is the current page
            var currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

            // If current page - scrollTo element
            if (currentPage.get('_id') === Adapt.location._currentId) {
                return Adapt.scrollTo(selector, settings);
            }


            Backbone.history.navigate('#/id/' + currentPage.get('_id'), navSettings);

            // If the element is on another page navigate and wait until pageView:ready is fired
            // Then scrollTo element
            Adapt.once('pageView:ready', function () {
                _.defer(function () {
                    //
                    //reset as it was alternative path
                    
                    Adapt.location = _.extend(Adapt.location, {
                        _currentLocation: undefined,
                        _lastVisitedPage: undefined,
                        _lastVisitedType: undefined,
                        _previousContentType: undefined,
                        _previousId: undefined
                    });
                    
                    Adapt.scrollTo(selector, settings)
                })
            });
        }


    });




    Adapt.register("go-next", GoNext);

    return GoNext;

});
