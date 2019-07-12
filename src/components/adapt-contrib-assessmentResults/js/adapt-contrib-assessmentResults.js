define(function (require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var AssessmentResults = ComponentView.extend({

        events: {
            'inview': 'onInview',
            'click .assessmentResults-retry-button button': 'onRetry',
            'click .assessmentResults-certificate-button button': 'onCertificateClicked'
        },

        preRender: function () {
            this.setupEventListeners();
            this.setupModelResetEvent();
            this.checkIfComplete();
            this.checkIfVisible();
        },

        checkIfVisible: function () {

            var wasVisible = this.model.get("_isVisible");
            var isVisibleBeforeCompletion = this.model.get("_isVisibleBeforeCompletion") || false;

            var isVisible = wasVisible && isVisibleBeforeCompletion;

            if (!isVisibleBeforeCompletion) {

                var assessmentModel = Adapt.assessment.get(this.model.get("_assessmentId"));
                if (!assessmentModel || assessmentModel.length === 0) return;

                var state = assessmentModel.getState();
                var isComplete = state.isComplete;
                var isAttemptInProgress = state.attemptInProgress;
                var attemptsSpent = state.attemptsSpent;

                isVisible = isVisible || isComplete || (!isAttemptInProgress && attemptsSpent > 0);

            }

            this.model.set('_isVisible', isVisible);
        },

        checkIfComplete: function () {
            var assessmentModel = Adapt.assessment.get(this.model.get("_assessmentId"));
            if (!assessmentModel || assessmentModel.length === 0) return;

            var state = assessmentModel.getState();
            var isComplete = state.isComplete;
            if (isComplete) {
                this.onAssessmentsComplete(state);
            } else {
                this.model.reset('hard', true);
            }
        },

        setupModelResetEvent: function () {
            if (this.model.onAssessmentsReset) return;
            this.model.onAssessmentsReset = function (state) {
                if (this.get("_assessmentId") === undefined ||
                    this.get("_assessmentId") != state.id) return;

                this.reset('hard', true);
            };
            this.model.listenTo(Adapt, 'assessments:reset', this.model.onAssessmentsReset);
        },

        postRender: function () {
            this.setReadyStatus();
        },

        setupEventListeners: function () {
            this.listenTo(Adapt, 'assessments:complete', this.onAssessmentsComplete);
            this.listenToOnce(Adapt, 'remove', this.onRemove);
        },

        removeEventListeners: function () {;
            this.stopListening(Adapt, 'assessments:complete', this.onAssessmentsComplete);
            this.stopListening(Adapt, 'remove', this.onRemove);
        },

        onAssessmentsComplete: function (state) {
            if (this.model.get("_assessmentId") === undefined ||
                this.model.get("_assessmentId") != state.id) return;

            this.model.set("_state", state);
            this.setFeedback();
            this.setImageFeedback();

            //show feedback component
            this.render();
            if (!this.model.get('_isVisible')) this.model.set('_isVisible', true);

        },

        onAssessmentComplete: function (state) {
            this.model.set("_state", state);
            this.setFeedback();
            this.setImageFeedback();

            //show feedback component
            if (!this.model.get('_isVisible')) this.model.set('_isVisible', true);
            this.render();
        },

        onInview: function (event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop || this._isVisibleBottom) {
                    this.setCompletionStatus();
                    this.$el.off("inview");
                }
            }
        },

        onRetry: function () {
            var state = this.model.get("_state");
            var assessmentModel = Adapt.assessment.get(state.id);

            assessmentModel.reset();
        },

        onCertificateClicked: function(){
            Adapt.trigger("certificate:show");
            Adapt.once("certificate:close", _.bind(this.onCertificateClosed, this));
        },
        onCertificateClosed: function(){
            Adapt.scrollTo("."+this.model.get("_parentId"));
        },
        
        setImageFeedback: function () {
            var feedbackBand = this.getFeedbackBand();
            
           //console.log("AssessmentResults", "setImageFeedback");
            if(feedbackBand.hasOwnProperty('img')){
                
            }
        },

        setFeedback: function () {

            var completionBody = this.model.get("_completionBody");
            var feedbackBand = this.getFeedbackBand();

            var state = this.model.get("_state");

            this.$el.removeClass('passed').removeClass('failed');
            if (state.isPass) {
                this.$el.addClass('passed');
            } else {
                this.$el.addClass('failed');
            }

           //console.log("AssessmentResults", "setFeedback state", state);
           //console.log("AssessmentResults", "setFeedback state._isPass", state.isPass);
           //console.log("AssessmentResults", "setFeedback $el", this.$el);
            state.feedbackBand = feedbackBand;
            state.feedback = feedbackBand.feedback;

            this.checkRetryEnabled();

            completionBody = this.stringReplace(completionBody, state);

            this.model.set("body", completionBody);

        },

        getFeedbackBand: function () {
            var state = this.model.get("_state");

            var bands = this.model.get("_bands");
            var scoreAsPercent = state.scoreAsPercent;

            for (var i = (bands.length - 1); i >= 0; i--) {
                if (scoreAsPercent >= bands[i]._score) {
                    return bands[i];
                }
            }

            return "";
        },

        checkRetryEnabled: function () {
            var state = this.model.get("_state");

            var assessmentModel = Adapt.assessment.get(state.id);
            if (!assessmentModel.canResetInPage()) return false;

            var isRetryEnabled = state.feedbackBand._allowRetry !== false;
            var isAttemptsLeft = (state.attemptsLeft > 0 || state.attemptsLeft === "infinite");

            var showRetry = isRetryEnabled && isAttemptsLeft;
            this.model.set("_isRetryEnabled", showRetry);

            if (showRetry) {
                var retryFeedback = this.model.get("_retry").feedback;
                retryFeedback = this.stringReplace(retryFeedback, state);
                this.model.set("retryFeedback", retryFeedback);
            } else {
                this.model.set("retryFeedback", "");
            }
        },

        stringReplace: function (string, context) {
            //use handlebars style escaping for string replacement
            //only supports unescaped {{{ attributeName }}} and html escaped {{ attributeName }}
            //will string replace recursively until no changes have occured

            var changed = true;
            while (changed) {
                changed = false;
                for (var k in context) {
                    var contextValue = context[k];

                    switch (typeof contextValue) {
                        case "object":
                            continue;
                        case "number":
                            contextValue = Math.floor(contextValue);
                            break;
                    }

                    var regExNoEscaping = new RegExp("((\\{\\{\\{){1}[\\ ]*" + k + "[\\ ]*(\\}\\}\\}){1})", "g");
                    var regExEscaped = new RegExp("((\\{\\{){1}[\\ ]*" + k + "[\\ ]*(\\}\\}){1})", "g");

                    var preString = string;

                    string = string.replace(regExNoEscaping, contextValue);
                    var escapedText = $("<p>").text(contextValue).html();
                    string = string.replace(regExEscaped, escapedText);

                    if (string != preString) changed = true;

                }
            }

            return string;
        },

        onRemove: function () {
            this.removeEventListeners();
        }

    });

    Adapt.register("assessmentResults", AssessmentResults);

});
