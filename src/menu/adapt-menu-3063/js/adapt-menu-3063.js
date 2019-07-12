define(function (require) {

    var Adapt = require('coreJS/adapt'),
        MenuView = require('coreViews/menuView'),
        completionCalculations = require('extensions/adapt-contrib-pageLevelProgress/js/completionCalculations'),
        scorm = require('extensions/adapt-contrib-spoor/js/scorm');

    var completionStatus = {
        assessmentCompleted: 0,
        assessmentTotal: 0,
        completed: 0,
        nonAssessmentCompleted: 0,
        nonAssessmentTotal: 0,
        percentageComplete: 0,
        subProgressCompleted: 0,
        subProgressTotal: 0,
        total: 0
    },
        Menu3063View = MenuView.extend({
            events: {
                "click .button": "triggerEvent"
            },
            postRender: function () {
                //console.log("Menu3063View", "postRender");
                //scan for completion status
                this.model.getChildren().each(function (item, index) {
                    //item - contentObjects JSON data
                    console.log("Menu3063View", "postRender#each", index, "_id", item.get("_id"), '_treatAsAvailable', item.get('_treatAsAvailable'));
                    if (item.get('_isAvailable') || item.get('_treatAsAvailable')) {

                        var id = item.get("_id");

                        //completion status
                        item.checkCompletionStatus();
                        item.checkInteractionCompletionStatus();
                        completionStatus[item.get("_id")] = {};
                        completionStatus[item.get("_id")] = completionCalculations.calculateCompletion(item);
                        var completionObject = completionStatus[item.get("_id")];
                        var completed = completionObject.nonAssessmentCompleted + completionObject.subProgressCompleted;
                        var total = completionObject.nonAssessmentTotal + completionObject.subProgressTotal;

                        var percentageComplete = Math.floor((completed / total) * 100);

                        completionObject.completed = completed;
                        completionObject.total = total;
                        completionObject.percentageComplete = percentageComplete;
                    }
                });
                //console.log("Menu3063View", "completionStatus", completionStatus);

                //build menu
                var nthChild = 0;
                this.model.getChildren().each(function (item) {
                    var id = item.get("_id");
                    //item - contentObjects JSON data
                    if (item.get('_isAvailable')) {

                        var completionObject = completionStatus[id];

                        //add progress to the model
                        item.progress = {
                            "completed": completionObject.completed,
                            "total": completionObject.total,
                            "percentageComplete": completionObject.percentageComplete
                        };
                        var isEnabled = item.get('_isEnabled'),
                            unlockCondition = item.get('unlockCondition');
                        if (unlockCondition && unlockCondition.complete) {
                            var unlock = false;
                            //
                            var ids = unlockCondition.complete;
                            if (ids.length > 0) {
                                unlock = true;
                                for (var i = 0, max = ids.length; i < max; i++) {
                                    if (completionStatus.hasOwnProperty(ids[i])) {
                                        var co = completionStatus[ids[i]];
                                        //console.info("Menu3063View", i, id, "ids[i]=" + ids[i], co);
                                        if (co.completed != co.total) {
                                            unlock = false;
                                            break;
                                        }
                                    } else {
                                        console.warn("Menu3063View", "Unknown contentObject id found: '" + ids[i] + "', check the 'unlockCondition.complete' for " + item.get("_id"));
                                    }
                                }

                            } else {
                                console.warn("Menu3063View", "No complete 'ids' found, check the 'unlockCondition' for " + item.get("_id"));
                                unlock = true;
                            }
                            //
                            if (unlock === false) {
                                item.set("_isEnabled", false);
                            } else {
                                item.set("_isEnabled", true);
                            }
                        } else {
                            //console.info("Menu3063View", "No 'unlockCondition' for " + id);
                        }


                        nthChild++;
                        item.set("_nthChild", nthChild);                      
						this.$('.menu-container-inner .menu-items').append(new Menu3063ItemView({
	
                            model: item
                        }).$el);
                    }
                });
            },
            triggerEvent: function (event) {
                event.preventDefault();
                var currentEvent = $(event.currentTarget).attr('data-event');
                Adapt.trigger(currentEvent);
            },
        }, {
            template: 'menu-3063'
        }),
        Menu3063ItemView = MenuView.extend({

            className: function () {
                var nthChild = this.model.get("_nthChild");
                return [
                    'menu-item',
                    'menu-item-' + this.model.get('_id'),
                    this.model.get('_classes'),
                    this.model.get('_isEnabled') != true ? 'menu-disabled' : '',
                    'nth-child-' + nthChild,
                    nthChild % 2 === 0 ? 'nth-child-even' : 'nth-child-odd',
                    'grid3',
                    'grid3-' + (((nthChild - 1) % 3) + 1)
                ].join(' ');
            },



            preRender: function () {
                //this.model.checkCompletionStatus();
                //this.model.checkInteractionCompletionStatus();




                //console.log("Menu3063ItemView", "menu completion", completionStatus[this.model.get("_id")], "completion", completionObject);

                //take all non-assessment components and subprogress info into the percentage
                //this allows the user to see if the assessments are passed (subprogress) and all other components are complete
                var completionObject = completionStatus[this.model.get("_id")],
                    completed = completionObject.completed,
                    total = completionObject.total,
                    percentageComplete = completionObject.percentageComplete,
                    progressParts = this.model.get("_progressParts"),
                        i,
                        max,
                        tmpStatus;
                if (progressParts) {
                    //list of ids to tak progress from
                    completed = 0;
                    total = 0;
                    percentageComplete = 0;
                    for (i = 0, max = progressParts.length; i < max; i++) {
                        tmpStatus = completionStatus[progressParts[i]];
                        if (tmpStatus) {
                            total += tmpStatus.total;
                            completed += tmpStatus.completed;
                            percentageComplete += tmpStatus.percentageComplete;
                        }
                    }
                    total /= max;
                    completed /= max;
                    percentageComplete /= max;
                }


                console.log("Menu3063ItemView:" + this.model.get("_id"), "completed", completed);
                console.log("Menu3063ItemView:" + this.model.get("_id"), "total", total);
                console.log("Menu3063ItemView:" + this.model.get("_id"), "percentageComplete", percentageComplete);


                var _isAssessment = this.model.get('_isAssessment') || false,
                    _isCompleted = _isAssessment && (scorm && scorm.lmsConnected ? (scorm.getStatus() === "passed" || scorm.getStatus() === "completed") : true);

                console.log("Menu3063ItemView", "_isAssessment", _isAssessment);
                console.log("Menu3063ItemView", "Adapt.course.get('_isComplete')", Adapt.course.get('_isComplete'));
                console.log("Menu3063ItemView", "percentageComplete", percentageComplete);
                console.log("Menu3063ItemView", "_isCompleted", _isCompleted);
                if (_isAssessment && _isCompleted && percentageComplete > 0) {
                    //course completed - assessment visited
                    var isPass = Adapt.assessment.getState().isPass || (scorm.getStatus() === "passed" || scorm.getStatus() === "completed");
                    console.log("Menu3063ItemView", "Adapt.assessment.getState().isPass", isPass);
                    console.log("Menu3063ItemView", "scorm.getStatus() === passed", scorm.getStatus(), scorm.getStatus() === "passed");
                    if (isPass) {
                        completed = total;
                    } else {
                        completed = 0;
                    }
                    //console.log("Menu3063ItemView", "completed", completed, "total", total);
                }


                if (completed > 0) {
                    this.model.set('_progressClass', (completed == total ? 'progress-completed' : 'progress-started'));
                } else {
                    this.model.set('_progressClass', 'progress-not-started');
                }

            },

            postRender: function () {

                this.$('.menu-item-progress').removeClass('progress-not-started')
                    .removeClass('progress-started')
                    .removeClass('progress-completed');
                //console.log("Menu3063ItemView:" + this.model.get("_id"), this.$('.menu-item-progress'));
                var progressClass = this.model.get('_progressClass');
                //console.log("Menu3063ItemView:" + this.model.get("_id"), "progressClass", progressClass);
                if (!_.isUndefined(progressClass) && progressClass != "") {
                    //console.log("Menu3063ItemView:" + this.model.get("_id"), "Add class");
                    this.$('.menu-item-progress').addClass(progressClass);
                }

                if (this.model.get('_isEnabled') != true) {
                    //disable anchor
                    this.$('a').each(function (i, o) {
                        //console.log("Menu3063ItemView", "i", i);
                        //console.log("Menu3063ItemView", "o", o);
                        //console.log("Menu3063ItemView", "$o", $(o));
                        $(o).attr('href', 'javascript:void(0)');
                    });
                }


                if (this.$("img").length > 0) {
                    this.$el.imageready(_.bind(function () {
                        this.setReadyStatus();
                    }, this));
                } else {
                    this.setReadyStatus();
                }
            }

        }, {
            template: 'menu-3063-item'
        });

    Adapt.on('router:menu', function (model) {
        $('html').addClass('in-menu');
        $('body').addClass('menu-background');
        $('#wrapper').append(new Menu3063View({
            model: model
        }).$el);

    });
    Adapt.on('router:page', function (model) {
        $('html').removeClass('in-menu');
        $('body').removeClass('menu-background');
    });

});
