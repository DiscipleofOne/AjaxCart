var CartAjaxHandler = Class.create();
CartAjaxHandler.prototype = {

    MINICARTFORMKEY: 0,
    MINICARTHANDLER: 0,
    MINICARTWRAPPER: '.minicart-wrapper',
    MESSAGESCONTAINER: '.col-main',
    MINICARTACTIVECLASS: '.skip-link.skip-cart.skip-active',
    MINICARTCLASS: '.skip-link.skip-cart',
    AJAXLOADINGID: 'ajax-loading-mask',
    CATEGORYVIEW: '.category-view',
    HEADERCARTID: 'header-cart',
    ADDTOCLASSBUTTON: '.button.btn-cart',

    initialize: function() {
        this.sendAjaxRequest();
        this.initAjaxLoadingOverlay();
        this.rejiggerOverlay();
        this.registerEventObserver();
    },

    initAjaxLoadingOverlay: function(){
        $$(this.CATEGORYVIEW).first().insert({top:  $(this.AJAXLOADINGID).remove()});

    },

    registerEventObserver: function() {
        Event.observe(window, 'resize', function(){this.rejiggerOverlay()});
    },
    // Need to replace existing setLocation with ajax command
    sendAjaxRequest: function(){
        var self = this;

        var origSetLocation = setLocation;

        setLocation = function(path) {

            if(0 <= path.indexOf((window.location.href).split('?')[0]))
            { // this means it's not a add product request
                origSetLocation(path);
            }
            else
            {
                new Ajax.Request(
                    self.checkSecureURL(path),
                    {
                        method: 'post',
                        onFailure: function (response) {self.addToCartFailure(response);},
                        onSuccess: function (response) {self.addToCartSuccess(response);},
                        onCreate: function () {self.addToCartCreate();},
                        onComplete: function () {self.addToCartComplete();}
                    });
            }
        }
    },

    rejiggerOverlay: function(){
        $(this.AJAXLOADINGID).setStyle({
            height: $$(this.CATEGORYVIEW).first().getStyle('height'),
            width: $$(this.CATEGORYVIEW).first().getStyle('width')
        });

    },

    checkSecureURL: function(testUrl) {
        if('https:' == location.protocol)
            return testUrl.replace(/^http:\/\//i, 'https://');
        return testUrl;
    },

    addToCartSuccess: function (ajaxResponse) {
        this.messageInsert("success-msg", ajaxResponse.responseText.evalJSON().message);
        this.reloadMiniCart(ajaxResponse.responseText.evalJSON().content, ajaxResponse.responseText.evalJSON().qty);
    },

    addToCartFailure: function (ajaxResponse) {
        this.messageInsert("error-msg", ajaxResponse.responseText.evalJSON().message);
    },

    addToCartCreate: function(){
        $(this.AJAXLOADINGID).setStyle({display: 'block'});
        $$(this.MINICARTWRAPPER).first().addClassName('loading');
    },

    addToCartComplete: function(){
        $(this.AJAXLOADINGID).setStyle({display: 'none'});
        $$(this.MINICARTWRAPPER).first().removeClassName('loading');
    },


    messageInsert : function(stateClass, message)
    {
        var messageString = '<ul class="messages"><li class=' + stateClass+ '><ul><li><span>' + message + '</span></li></ul></li></ul>';
        $$(this.MESSAGESCONTAINER).first().insert({
            top: messageString
        });
    },
    reloadMiniCart: function (content, qty) {
        $(this.HEADERCARTID).update(content);
        if(!qty) qty = 1;
        if(0 == Number($$('.count').first().innerHTML)) $$('.skip-link.skip-cart.no-count').first().removeClassName('no-count');
        $$('.count').first().update(Number(qty) + Number($$('.count').first().innerHTML));

    }
};

Event.observe(window, 'load', function(){
    new CartAjaxHandler();
}.bind(window));


