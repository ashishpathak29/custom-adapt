define(function(require) {
    var QuestionView = require('coreViews/questionView');
    var Adapt = require('coreJS/adapt');
    var numberOfRequiredAnswers = 0;
   var numberOfCorrectAnswers = 0;
   var numberOfIncorrectAnswers = 0;
     var _attemptsLeft = '';
	 var saveCorrectAnswer = [];
	 
var flag = false;
    var Mcq = QuestionView.extend({

        events: {
            'focus .mcq-item input': 'onItemFocus',
            'blur .mcq-item input': 'onItemBlur',
            'change .mcq-item input': 'onItemSelected',
            'keyup .mcq-item input': 'onKeyPress',
            'click .mcq-inner .feedbackBox .cross_btn': 'onFeedbackChange',
            
        },
        
       
        
        

        resetQuestionOnRevisit: function() {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
            this.setAllItemsEnabled();
            this.deselectAllItems();
            
        },

        setupQuestion: function() {
            // if only one answer is selectable, we should display radio buttons not checkboxes
            this.model.set("_isRadio", (this.model.get("_selectable") == 1));

            this.model.set('_selectedItems', []);

            this.setupQuestionItemIndexes();

            this.setupRandomisation();

            this.restoreUserAnswers();
          
            
            
        },
        
        onFeedbackChange:function(){
           
            this.$('.mcq-inner .feedbackBox').css('display','none');
            
          
          
        },

        setupQuestionItemIndexes: function() {
            var items = this.model.get("_items");
            if (items && items.length > 0) {
                for (var i = 0, l = items.length; i < l; i++) {
                    if (items[i]._index === undefined) items[i]._index = i;
                }
            }
        },

        setupRandomisation: function() {
            if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
                this.model.set("_items", _.shuffle(this.model.get("_items")));
            }
        },

        restoreUserAnswers: function() {
            if (!this.model.get("_isSubmitted")) return;

            var selectedItems = [];
            var items = this.model.get("_items");
            var userAnswer = this.model.get("_userAnswer");
            _.each(items, function(item, index) {
                item._isSelected = userAnswer[item._index];
                if (item._isSelected) {
                    selectedItems.push(item)
                }
            });

            this.model.set("_selectedItems", selectedItems);

            this.setQuestionAsSubmitted();
            this.markQuestion();
            this.setScore();
            this.showMarking();
            this.setupFeedback();
        },

        disableQuestion: function() {
            this.setAllItemsEnabled(false);
            
        },

        enableQuestion: function() {
            this.setAllItemsEnabled(true);
             this.$('.mcq-inner .feedbackBox').css('display','none');
        },

        setAllItemsEnabled: function(isEnabled) {
            _.each(this.model.get('_items'), function(item, index) {
                var $itemLabel = this.$('label').eq(index);
                var $itemInput = this.$('input').eq(index);

                if (isEnabled) {
                    $itemLabel.removeClass('disabled');
                    $itemInput.prop('disabled', false);
                } else {
                    $itemLabel.addClass('disabled');
                    $itemInput.prop('disabled', true);
                }
            }, this);
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
        },

        onKeyPress: function(event) {
            if (event.which === 13) { //<ENTER> keypress
                this.onItemSelected(event);
            }
        },

        onItemFocus: function(event) {
            if (this.model.get('_isEnabled') && !this.model.get('_isSubmitted')) {
                $("label[for='" + $(event.currentTarget).attr('id') + "']").addClass('highlighted');
            }
        },

        onItemBlur: function(event) {
            $("label[for='" + $(event.currentTarget).attr('id') + "']").removeClass('highlighted');
        },

        onItemSelected: function(event) {

            if (this.model.get('_isEnabled') && !this.model.get('_isSubmitted')) {
                var selectedItemObject = this.model.get('_items')[$(event.currentTarget).parent('.component-item').index()];
                this.toggleItemSelected(selectedItemObject, event);
                
            }

        },

        toggleItemSelected: function(item, clickEvent) {
            var selectedItems = this.model.get('_selectedItems');
            var itemIndex = _.indexOf(this.model.get('_items'), item),
                $itemLabel = this.$('label').eq(itemIndex),
                $itemInput = this.$('input').eq(itemIndex),
                selected = !$itemLabel.hasClass('selected');

            if (selected) {
                if (this.model.get('_selectable') === 1) {

                    this.$('label').removeClass('selected');
                    this.$('input').prop('checked', false);
                    this.deselectAllItems();
                    selectedItems[0] = item;
                     
                   
                } else if (selectedItems.length < this.model.get('_selectable')) {
                    selectedItems.push(item);

                } else {
                    clickEvent.preventDefault();
                    return;
                }
            
                $itemLabel.addClass('selected');
                $itemLabel.a11y_selected(false);
               
                
            } 
            else {
                selectedItems.splice(_.indexOf(selectedItems, item), 1);
                $itemLabel.removeClass('selected');
                $itemLabel.a11y_selected(false);
            }

            if (selectedItems.length > 0) {
                this.$('.buttons-action').a11y_cntrl_enabled(true);
            } else {
                this.$('.buttons-action').a11y_cntrl_enabled(false);
            }
            $itemInput.prop('checked', selected);
            item._isSelected = selected;
            this.model.set('_selectedItems', selectedItems);
        },

        // check if the user is allowed to submit the question
        canSubmit: function() {
            var count = 0;

            _.each(this.model.get('_items'), function(item) {
                if (item._isSelected) {
                    count++;
                }
            }, this);
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
			 
				
				
            return (count > 0) ? true : false;

        },

        // Blank method to add functionality for when the user cannot submit
        // Could be used for a popup or explanation dialog/hint
        onCannotSubmit: function() {},

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {
            var userAnswer = [];

            var items = this.model.get('_items').slice(0);
            items.sort(function(a, b) {
                return a._index - b._index;
            });

            _.each(items, function(item, index) {
                userAnswer.push(item._isSelected);
            }, this);
            this.model.set('_userAnswer', userAnswer);
        },

        isCorrect: function() {

            
			var numberOfRequiredAnswers = 0;
            var numberOfCorrectAnswers = 0;
            var numberOfIncorrectAnswers = 0;
            _.each(this.model.get('_items'), function(item, index) {

                var itemSelected = (item._isSelected || false);

                if (item._shouldBeSelected) {
                    numberOfRequiredAnswers++;

                    if (itemSelected) {
                        numberOfCorrectAnswers++;

                        item._isCorrect = true;

                        this.model.set('_isAtLeastOneCorrectSelection', true);
                    }

                } else if (!item._shouldBeSelected && itemSelected) {
                    numberOfIncorrectAnswers++;

                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
            this.model.set('_numberOfRequiredAnswers', numberOfRequiredAnswers);

            // Check if correct answers matches correct items and there are no incorrect selections
            var answeredCorrectly = (numberOfCorrectAnswers === numberOfRequiredAnswers) && (numberOfIncorrectAnswers === 0);
            return answeredCorrectly;
        },

        // Sets the score based upon the questionWeight
        // Can be overwritten if the question needs to set the score in a different way
        setScore: function() {
            var questionWeight = this.model.get("_questionWeight");
            var answeredCorrectly = this.model.get('_isCorrect');
            var score = answeredCorrectly ? questionWeight : 0;
            this.model.set('_score', score);
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
                  
                    if(_attemptsLeft > 0){
                        feedbackText = this.model.get('_feedback')._incorrect.notFinal;
                        this.$('.buttons-action').html('Try Again');
                        this.$('.buttons-action').attr('title', 'Try Again');
					
                        
                    }
				if(_attemptsLeft == 0){
                        feedbackText = this.model.get('_feedback')._incorrect.final;
                       
                        
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
		
            
            
            this.model.set('_feedBox', feedbackText); 
            var customFeedback = this.model.get('_feedBox');
            this.$('.mcq-inner .feedbackBox').css('display','block');
            this.$('.feedbackBox .feedText').html(customFeedback);
              
        },

        setupIndividualFeedback: function(selectedItem) {
            this.model.set({
                feedbackTitle: this.model.get('title'),
                feedbackMessage: selectedItem.feedback
                
            });
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            _.each(this.model.get('_items'), function(item, i) {
                var $item = this.$('.component-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');



            }, this);
			
			saveCorrectAnswer = [];
			this.showCorrectAnswer();
			
			for (var j = 0; j < this.model.get('_items').length; j++ )
			{
				this.$('.item-' + saveCorrectAnswer[j] + ' .mcq-item-icon.mcq-correct-icon.icon.icon-tick').css('display', 'block');
				
				if (this.model.get("_selectable") == 1)
				{
					this.$('.item-'+saveCorrectAnswer[j] + ' .mcq-item-icon.mcq-answer-icon.radio.component-item-text-color.icon').css('display', 'none');
				}
				else
				{
					this.$('.item-'+saveCorrectAnswer[j] + ' .mcq-item-icon.mcq-answer-icon.checkbox.component-item-text-color.icon').css('display', 'none');
				}				
			}
			
        },

        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.model.set({
                _userAnswer: []
            });
        },

        // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {

            this.deselectAllItems();
            this.resetItems();
        },

        deselectAllItems: function() {
            this.$el.a11y_selected(false);
            _.each(this.model.get('_items'), function(item) {
                item._isSelected = false;
            }, this);
        },

        resetItems: function() {
            this.$('.component-item label').removeClass('selected');
            this.$('.component-item').removeClass('correct incorrect');
            this.$('input').prop('checked', false);
            this.model.set({
                _selectedItems: [],
                _isAtLeastOneCorrectSelection: false
            });
        },

        showCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, item._shouldBeSelected);
				if (item._shouldBeSelected == true)
				{
				//alert(this.model.get('_items')._index)
				saveCorrectAnswer.push(index);
				}
				
            }, this);
        },

        setOptionSelected: function(index, selected) {
            var $itemLabel = this.$('label').eq(index);
            var $itemInput = this.$('input').eq(index);
            if (selected) {
                //$itemLabel.addClass('selected');
                //$itemInput.prop('checked', true);
            } else {
                //$itemLabel.removeClass('selected');
               // $itemInput.prop('checked', false);
            }
        },

        hideCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, this.model.get('_userAnswer')[item._index]);
            }, this);
        },

        /**
         * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
         * returns the user's answers as a string in the format "1,5,2"
         */
        getResponse: function() {
            var selected = _.where(this.model.get('_items'), {
                '_isSelected': true
            });
            var selectedIndexes = _.pluck(selected, '_index');
            // indexes are 0-based, we need them to be 1-based for cmi.interactions
            for (var i = 0, count = selectedIndexes.length; i < count; i++) {
                selectedIndexes[i]++;
            }
            return selectedIndexes.join(',');
        },

        /**
         * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
         */
        getResponseType: function() {
            return "choice";
        }

    });

    Adapt.register("mcq", Mcq);

    return Mcq;
});