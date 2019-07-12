define(function (require) {

    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt'),
        scorm = require('extensions/adapt-contrib-spoor/js/scorm');
    var CertificateInputNameView = Backbone.View.extend({
        className: "certificate-input-name",
        DEBUG: false,
        log: function () {
            if (this.DEBUG == false) return;
            var args = Array.prototype.slice.call(arguments);
            //args.unshift(this.model.get("_id"));
            args.unshift("CertificateInputNameView");


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
            'click .submit-btn': 'onSubmitClicked',
            'click .close-btn': 'onCloseClicked',
            'keyup .text-box': 'onInputUpdated'
        },
        initialize: function () {
            //this.log("initialize"); //, );

            this.render();
            this.listenTo(Adapt, "remove", this.remove);
            //hide to wait for an image
            $(this.el).hide();
            this.$('.bg-image').imageready(_.bind(function () {
                $(this.el).show(); //image loaded - show
                //$("body, html").css('overflow', 'hidden');
            }, this));

            return this;
        },
        render: function () {
            //this.log("render");//, this, this.model, this.model.get('input'));
            var data = {}
            if (!_.isUndefined(this.model) && this.model.has('input')) {
                data = this.model.get('input');
            }
            var template = Handlebars.templates["certificate-input-name"];

            //this.log("template", template);
            //this.log("template(data)", template(data));

            $(this.el).html(template(data)).appendTo('#wrapper');


            this.$submit = this.$('.submit-btn');
            this.$inputs = this.$('.text-box');
           //console.log("this.$submit", this.$submit);
           //console.log("this.$inputs", this.$inputs);

            this.checkSubmitStatus();
            
            return this;
        },
        remove: function () {

            //$("body, html").css('overflow', '');
            this.off("remove", this.remove);
            Backbone.View.prototype.remove.apply(this, arguments);
        },
        isInputValid: function () {

            var valid = true;
            //for each .text-box
            this.$inputs.each(function (i, input) {
               //console.log(i, $(input).val());
                if (/^\s*$/.test($(input).val())) {
                    valid = false;
                    return false;
                }
            });

            return valid;
        },
        checkSubmitStatus: function () {
            if (this.isInputValid()) {
                //allowed to sent
                this.$submit.removeClass('cert-disabled')
                    .addClass('cert-active');
            } else {
                //dissalow to sent
                this.$submit.removeClass('cert-active')
                    .addClass('cert-disabled');
            }
        },
        onInputUpdated: function (e) {
            if (e) {
                if (e.originalEvent.keyIdentifier === "Enter" && this.isInputValid()) {
                    this.onSubmitClicked();
                    return;
                }
                //
                this.checkSubmitStatus();
            }

        },
        onSubmitClicked: function (e) {
            //this.log("onSubmitClicked", this); //, );
            if (e) e.preventDefault();
            if (!this.isInputValid()) return;
            var model = {isStandalone:true};//must be offline as this view was displayed

            var inputs = this.$('.form input');

            //this.log("Inputs", inputs);

            for (var i = 0, l = inputs.length; i < l; i++) {
                model[inputs[i].name] = inputs[i].value;
            }

            this.remove();
            _.defer(function () {
                Adapt.trigger('certificate:show', model);
            });

        },
        onCloseClicked: function(e) {
            if(e) e.preventDefault();
            //
            this.remove();
        }

    });
    return CertificateInputNameView;
});
