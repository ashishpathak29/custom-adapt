define(function (require) {

    var DateUtils = require('./date-utils');
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt');
    var CertificateView = Backbone.View.extend({

        className: "certificate",
        DEBUG: false,
        log: function () {
            if (this.DEBUG == false) return;
            var args = Array.prototype.slice.call(arguments);
            //args.unshift(this.model.get("_id"));
            args.unshift("CertificateView");


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
            'click .print-btn':'onPrintClicked',
            'click .close-btn':'onCloseClicked'
        },
        initialize: function () {
            this.log("initialize", this.model); //, );
            var today = new Date();
            var formatted = DateUtils.format(this.model.get('dateFormat') || '', today);
            this.model.set('date', formatted);

            
            
            
            this.render();
            this.listenTo(Adapt, "remove", this.remove);
            
            //hide to wait for an image
            $(this.el).hide();
            this.$('.bg-image').imageready(_.bind(function () {
                $(this.el).show();//image loaded - show
                //$("body, html").css('overflow', 'hidden');
            }, this));
            
            return this;
        },
        render: function () {
            //this.log("render", this); //, );

            var data = this.model.toJSON();
            var template = Handlebars.templates["certificate"];

            //this.log("template", template);
            //this.log("template(data)", template(data));

            $(this.el).html(template(data)).appendTo('#wrapper');

            return this;
        },
        remove: function () {

            //$("body, html").css('overflow','');
            this.off("remove", this.remove);
            Backbone.View.prototype.remove.apply(this, arguments);
        },
        onPrintClicked:function(e){
            //this.log("onPrintClicked", this); //, );
            //alert("onPrintClicked");
            if (e) e.preventDefault();
            window.print();
            //this.remove();
        },
        onCloseClicked: function(e) {
            if(e) e.preventDefault();
            //
            _.defer(function(){
                Adapt.trigger("certificate:close");
            });
            //
            this.remove();
        }




    });
    return CertificateView;
})
