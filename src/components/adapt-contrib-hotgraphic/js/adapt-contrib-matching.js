define(function(require) {

    var QuestionView = require('coreViews/questionView');
    var Adapt = require('coreJS/adapt');
 var numberOfRequiredAnswers = 0;
   var numberOfCorrectAnswers = 0;
   var numberOfIncorrectAnswers = 0;
     var _attemptsLeft = '';
var flag = false;
    var Matching = QuestionView.extend({
		
		
		 events: {
			'change .matching-item.item': '_onSelected',
			   'click .matching-inner .feedbackBox .cross_btn': 'onFeedbackChange',
		 },
		_onSelected: function(event) {
			this.$('.buttons-action').a11y_cntrl_enabled(true);
			this.canSubmit();
        },

        // Used by questionView to disable the question during submit and complete stages
        disableQuestion: function() {
			
            this.$('.matching-select').prop('disabled', true);
			
        },

        // Used by questionView to enable the question during interactions
        enableQuestion: function() {
            this.$('.matching-select').prop('disabled', false);
        },

        // Used by questionView to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {
            this.resetQuestion();
        },

        setupQuestion: function() {
			
            this.setupItemIndexes();
            
            this.restoreUserAnswers();

            this.setupRandomisation();
        },

        setupItemIndexes: function() {

            _.each(this.model.get("_items"), function(item, index) {
                if (item._index == undefined) {
                    item._index = index;
                    item._selected = false;
                }
                _.each(item._options, function(option, index) {
                    if (option._index == undefined) {
                        option._index = index;
                        option._isSelected = false;
                    }
                });
            });

        },

        restoreUserAnswers: function() {
            if (!this.model.get("_isSubmitted")) return;

            var userAnswer = this.model.get("_userAnswer");

            _.each(this.model.get("_items"), function(item, index) {
                _.each(item._options, function(option, index) {
                    if (option._index == userAnswer[item._index]) {
                        option._isSelected = true;
                        item._selected = option;
                    }
                });
            });

            this.setQuestionAsSubmitted();
            this.markQuestion();
            this.setScore();
            this.showMarking();
            this.setupFeedback();
        },

        setupRandomisation: function() {
            if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
                _.each(this.model.get('_items'), function(item) {
                    item._options = _.shuffle(item._options);
                });
            }
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
        },

        canSubmit: function() {
			
            var canSubmit = true;
			
            $('.matching-select option:selected', this.el).each(_.bind(function(index, element) {

                var $element = $(element);

                if ($element.index() == 0) {
                    canSubmit = false;
                    $element.parent('.matching-select').addClass('error');
					this.$('.buttons-action').a11y_cntrl_enabled(false);
                }else{
					
             
					
				}
            }, this));
			
            return canSubmit;
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {
			
            //TODO have this highlight all the drop-downs the user has yet to select.
            //Currently it just highlights the first one, even if that one has been selected
        },

        storeUserAnswer: function() {
			
            var userAnswer = new Array(this.model.get('_items').length);
            var tempUserAnswer = new Array(this.model.get('_items').length);

            _.each(this.model.get('_items'), function(item, index) {

                var $selectedOption = this.$('.matching-select option:selected').eq(index);
                var optionIndex = $selectedOption.index() - 1;

                item._options[optionIndex]._isSelected = true;
                item._selected = item._options[optionIndex];

                tempUserAnswer[item._index] = optionIndex;
                userAnswer[item._index] = item._options[optionIndex]._index;
            }, this);

            this.model.set('_userAnswer', userAnswer);
            this.model.set('_tempUserAnswer', tempUserAnswer);
        },

        isCorrect: function() {

            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_items'), function(item, index) {

                if (item._selected && item._selected._isCorrect) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                    this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
                    this.model.set('_isAtLeastOneCorrectSelection', true);
                } else {
                    item._isCorrect = false;
					
                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

            if (numberOfCorrectAnswers === this.model.get('_items').length) {
                return true;
            } else {
                return false;
            }

        },

        setScore: function() {
            var questionWeight = this.model.get("_questionWeight");

            if (this.model.get('_isCorrect')) {
                this.model.set('_score', questionWeight);
                return;
            }

            var numberOfCorrectAnswers = this.model.get('_numberOfCorrectAnswers');
            var itemLength = this.model.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.model.set('_score', score);
        },
		onFeedbackChange:function(){
           
            this.$('.matching-inner .feedbackBox').css('display','none');
            
          
          
        },
		 setupFeedback: function() {
            var attemptsleft = this.model.get("_attempts");
            var feedbackText="";
          
            if (this.model.get('_isCorrect')) {
                feedbackText = this.model.get('_feedback').correct;
               
               
            } else if (this.isPartlyCorrect()) {
                
                feedbackText = this.model.get('_feedback')._incorrect.notFinal;
                this.$('.buttons-action').html('Submit');
                this.$('.buttons-action').attr('title', 'Submit');
                this.$('.buttons-action').a11y_cntrl_enabled(false);
                
            
            } else {
                
                
                    _attemptsLeft = this.model.get("_attempts");
                    _attemptsLeft =  _attemptsLeft - 1;
                    this.model.set("_attempts" , _attemptsLeft); 
                  
                   /* if(_attemptsLeft > 0){
                        feedbackText = this.model.get('_feedback')._incorrect.notFinal;
                        this.$('.buttons-action').html('Try Again');
                        this.$('.buttons-action').attr('title', 'Try Again');
					
                        
                    }*/
				if(_attemptsLeft == 0){
                        feedbackText = this.model.get('_feedback')._incorrect.final;
                        this.$('.buttons-action').html('Submit');
                this.$('.buttons-action').attr('title', 'Submit');
                this.$('.buttons-action').a11y_cntrl_enabled(false);
                        
                    }
					
				/*else{
                        feedbackText = this.model.get('_feedback')._incorrect.final;
                        this.$('.buttons-action').a11y_cntrl_enabled(false);
                        
                    }*/

//                if ((this.model.get('_selectable') === 1) && this.model.get('_selectedItems')[0].feedback) {
//                    this.setupIndividualFeedback(this.model.get('_selectedItems')[0]);
//                    return;
//                    
//                } else {
//                    this.setupIncorrectFeedback();
//                    
//                }
//                
//                
                
                
            }
            if($("body").width() >= 768){
				//window.scrollBy(0, 200);
			   $('html, body').animate({
				scrollTop: '+=400'
				}, 500);
			}
			 if($("body").width() <= 768){
				//window.scrollBy(0, 200);
			   $('html, body').animate({
				scrollTop: '+=400'
				}, 500);
			}

            
            this.model.set('_feedBox', feedbackText); 
            var customFeedback = this.model.get('_feedBox');
            this.$('.matching-inner .feedbackBox').css('display','block');
            this.$('.feedbackBox .feedText').html(customFeedback);
              
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {

            _.each(this.model.get('_items'), function(item, i) {

                var $item = this.$('.matching-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        // Used by the question to determine if the question is incorrect or partly correct
        // Should return a boolean
        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.model.set({_userAnswer: []});
        },

        // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {

            this.$('.matching-select option').prop('selected', false);
            
            this.$(".matching-item").removeClass("correct").removeClass("incorrect");
            
            this.model.set('_isAtLeastOneCorrectSelection', false);
            
            _.each(this.$('.matching-select'), function(item) {
                this.selectOption($(item), 0);
				
            }, this);
            
            _.each(this.model.get("_items"), function(item, index) {
                _.each(item._options, function(option, index) {
                    option._isSelected = false;
                });
            });
        },

        showCorrectAnswer: function() {

            _.each(this.model.get('_items'), function(item, index) {
	
                var correctOptionIndex;

                _.each(item._options, function(option, optionIndex) {
                    if (option._isCorrect) {
                        correctOptionIndex = optionIndex + 1;
                    }
                }, this);

                var $parent = this.$('.matching-select').eq(index);

                this.selectOption($parent, correctOptionIndex);
            }, this);
        },

        hideCorrectAnswer: function() {

            for (var i = 0, count = this.model.get('_items').length; i < count; i++) {
                var $parent = this.$('.matching-select').eq(i);

                var index = this.model.has('_tempUserAnswer')
                  ? this.model.get('_tempUserAnswer')[i] + 1
                  : this.model.get('_userAnswer')[i] + 1;

                $('option', $parent).eq(index).prop('selected', true);

                this.selectOption($parent, index);
            }
        },

        selectOption: function($parent, optionIndex) {
			
            $("option", $parent).eq(optionIndex).prop('selected', true);
		
        },

        /**
        * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * Returns the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1, option 3 in drop-down 2
        * and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor, depending on which SCORM version is being used.
        */
        getResponse: function() {
			
            var userAnswer = this.model.get('_userAnswer');
            var responses = [];

            for(var i = 0, count = userAnswer.length; i < count; i++) {
                responses.push((i + 1) + "." + (userAnswer[i] + 1));// convert from 0-based to 1-based counting
            }
            return responses.join('#');
        },

        /**
        * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        */
        getResponseType: function() {
            return "matching";
        }

    });

    Adapt.register("matching", Matching);

    return Matching;

});
