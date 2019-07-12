define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var completionCalculations = require('./completionCalculations');

    var PageLevelProgressView = require('extensions/adapt-contrib-pageLevelProgress/js/PageLevelProgressView');

    var PageLevelProgressNavigationView = Backbone.View.extend({

        tagName: 'button',

        className: 'base page-level-progress-navigation',
		

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(Adapt, 'router:location', this.updateProgressBar);
            this.listenTo(Adapt, 'pageLevelProgress:update', this.refreshProgressBar);
            this.listenTo(this.collection, 'change:_isInteractionComplete', this.updateProgressBar);
            this.listenTo(this.model, 'change:_isInteractionComplete', this.updateProgressBar);
			//this.listenTo(Adapt.course, 'change:_isComplete', this.onModuleCompletion);
            this.$el.attr('role', 'button');
            this.ariaText = '';

            if (Adapt.course.has('_globals') && Adapt.course.get('_globals')._extensions && Adapt.course.get('_globals')._extensions._pageLevelProgress && Adapt.course.get('_globals')._extensions._pageLevelProgress.pageLevelProgressIndicatorBar) {
                this.ariaText = Adapt.course.get('_globals')._extensions._pageLevelProgress.pageLevelProgressIndicatorBar +  ' ';
            }
            
            this.render();
            
            _.defer(_.bind(function() {
                this.updateProgressBar();
            }, this));
        },

        events: {
            'click': 'onProgressClicked'
        },

        render: function() {
            var components = this.collection.toJSON();
            var data = {
                components: components,
                _globals: Adapt.course.get('_globals')
            };            

            var template = Handlebars.templates['pageLevelProgressNavigation'];
            $('.navigation-inner').append(this.$el.html(template(data)));
            return this;
        },
        
        refreshProgressBar: function() {
            var currentPageComponents = this.model.findDescendants('components').where({'_isAvailable': true});
            var availableChildren = completionCalculations.filterAvailableChildren(currentPageComponents);
            var enabledProgressComponents = completionCalculations.getPageLevelProgressEnabledModels(availableChildren);
            this.collection = new Backbone.Collection(enabledProgressComponents);
            this.updateProgressBar();
        },
		
		onModuleCompletion:function()
		{
		  setTimeout(function(){ var lightbox = 
		   '<div id="lightbox">' +
			'<div id="content">' +
			 '<i>You have completed this topic. Select</i>'+' ‘<b>X</b>’ '+'<i>to exit and go back to the Course Outline.</i>' + '<a href="javascript:void(0);" class="hidePopup" >OK</a>'+
			'</div>' + 
		   '</div>';

		   //insert lightbox HTML into page
		   $('body #wrapper').prepend(lightbox);

		   $('a.hidePopup').on('click', function(){
			$("#lightbox").css("display", "none");
		   })  }, 2000);
		},
			
        updateProgressBar: function() {
			   
			 
            var completionObject = completionCalculations.calculateCompletion(this.model);
            
            //take all assessment, nonassessment and subprogress into percentage
            //this allows the user to see if assessments have been passed, if assessment components can be retaken, and all other component's completion
            
            var completed = completionObject.nonAssessmentCompleted + completionObject.assessmentCompleted + completionObject.subProgressCompleted;
            var total  = completionObject.nonAssessmentTotal + completionObject.assessmentTotal + completionObject.subProgressTotal;

            var percentageComplete = Math.floor((completed / (total-1))*100);


           // this.$('.page-level-progress-navigation-bar').css('width', percentageComplete + '%');
			if(percentageComplete <= 0){
				this.$('.proLevelvalue').css('opacity', '0');
				this.$('.proLevel').css('opacity', '0');
                this.$('.proLevel').css('width', '0px');
                this.$('.proLevel').css('transition', 'all 1s');
                this.$('.proLevelvalue').css('visibility', 'hidden');
				this.$('.proLevel').css('visibility', 'hidden');
			}
			
			if(percentageComplete > 0){
				this.$('.proLevelvalue').css('opacity', '1');
				this.$('.proLevel').css('opacity', '1');
                this.$('.proLevelvalue').css('visibility', 'visible');
				this.$('.proLevel').css('visibility', 'visible');
				this.$('.proLevel').css('width', percentageComplete + '%');
				this.$('.proLevel').css('background', '#9acc2e');
				this.$('.proLevelvalue').text(percentageComplete+ '%');
				this.$('.proLevelvalue').css('left', ((percentageComplete)-1)+'%');
			}
			
			if(percentageComplete >95){
				this.$('.proLevelvalue').css('left', ((percentageComplete)-3)+'%');
			}
			
			if (percentageComplete >= 100)
			{				
				 setTimeout(function() { $('.checkCompletion .text-body-inner').html("<h6 class='complete-class'>Congratulations!</h6><p>Select <b>Done</b> to exit this topic and return to the course menu.</p> <button class='buttons-action  custom-button hideButton' href='javascript:void(0);'>Done</button>") 		
				$('.hideButton').on('click', function(){
					top.window.close();
		   });
			}, 1000);
			}
			
            // Add percentage of completed components as an aria label attribute
            this.$el.attr('aria-label', this.ariaText);
            this.$el.attr('title', this.ariaText);

            // Set percentage of completed components to model attribute to update progress on MenuView
            this.model.set('completedChildrenAsPercentage', percentageComplete);
			//alert(percentageComplete+"  per")
			
        },

        onProgressClicked: function(event) {
            if(event && event.preventDefault) event.preventDefault();
            Adapt.drawer.triggerCustomView(new PageLevelProgressView({collection: this.collection}).$el, false);
        }
				

    });

    return PageLevelProgressNavigationView;

});
