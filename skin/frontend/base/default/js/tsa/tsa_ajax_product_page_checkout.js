var CartAjaxHandler = Class.create();
CartAjaxHandler.prototype = {

    PRODUCTFORMOBJECT: 'product_addtocart_form',
    MINICARTHANDLER: 0,
    ADDTOCARTFORM: 0,
    AJAXMASKID: 'ajax-loading-mask',
    BLOCKTOOVERLAY: '.product-essential',

    initialize: function() {
        // Initialize variable
        this.ADDTOCARTFORM = $(this.AJAXLOADINGID);
        this.MINICARTHANDLER = new Minicart ($('product_addtocart_form').action.split("/")[$('product_addtocart_form').action.split("/").indexOf('form_key') + 1]);

        // Start overloading stuff
        this.overloadSubmit();

        // Move Ajax Loading Overlay Under Product-shop class
        $$(this.BLOCKTOOVERLAY).first().insert({
            top:  $(this.AJAXMASKID).remove()
            }
        );

        // Resize the overlay initially
        this.rejiggerOverlay();

        Event.observe(window, 'resize', function(){this.rejiggerOverlay()})

    },

    rejiggerOverlay: function(){
        $(this.AJAXMASKID).setStyle({
            height: $$(this.BLOCKTOOVERLAY).first().getStyle('height'),
            width: $$(this.BLOCKTOOVERLAY).first().getStyle('width')
        });

    },

    overloadSubmit: function() {
        var self = this;
        $(self.PRODUCTFORMOBJECT).submit = function() {
            new Ajax.Request(
                $(self.PRODUCTFORMOBJECT).action,
                {
                    method: 'post',
                    parameters: $(self.PRODUCTFORMOBJECT).serialize(true),
                    onFailure: function(response) {self.addToCartFailure(response);},
                    onSuccess: function(response) {self.addToCartSuccess(response);},
                    onCreate: function() {self.addToCartCreate();},
                    onComplete: function(){self.addToCartComplete();}
            });
        };
    },

    addToCartSuccess: function (ajaxResponse) {
        $(this.PRODUCTFORMOBJECT).reset();
        this.messageInsert("success-msg", ajaxResponse.responseText.evalJSON().message);
        this.reloadMiniCart(ajaxResponse.responseText.evalJSON().content, ajaxResponse.responseText.evalJSON().qty);
    },

    addToCartFailure: function (ajaxResponse) {
        this.messageInsert("error-msg", ajaxResponse.responseText.evalJSON().message);
    },

    addToCartCreate: function(){
        $(this.PRODUCTFORMOBJECT).disable();
        this.MINICARTHANDLER.showOverlay();
        $('ajax-loading-mask').setStyle({display: 'block'});
    },

    addToCartComplete: function(){
        $(this.PRODUCTFORMOBJECT).enable();
        this.MINICARTHANDLER.hideOverlay();
        $$('.product-shop').first().removeClassName('loading');
        $('ajax-loading-mask').setStyle({display: 'none'});
    },



    messageInsert : function(stateClass, message)
    {
        var messageString = '<ul class="messages"><li class=' + stateClass+ '><ul><li><span>' + message + '</span></li></ul></li></ul>';

        $$('.col-main')[0].insert({
            top: messageString
        });
    },
    reloadMiniCart: function (content, qty) {
        // Updates the inner cart items
        // The actual items in the cart that are actually displayed
        $('header-cart').update(content);

        // Updates the cart quantity
        // Removes count tag if nothing in the cart originally
        if(0 == Number($$('.count').first().innerHTML)) $$('.skip-link.skip-cart.no-count').first().removeClassName('no-count');

        $$('.count').first().update(Number(qty) + Number($$('.count').first().innerHTML));

    }
};



Event.observe(window, 'load', function(){
    new CartAjaxHandler();
}.bind(window));


