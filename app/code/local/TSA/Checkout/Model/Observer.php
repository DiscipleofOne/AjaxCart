<?php

class TSA_Checkout_Model_Observer {

    public function addProductAjax ($observer) {

        $controller = $observer->getControllerAction();

        $controller->setFlag('',Mage_Core_Controller_Varien_Action::FLAG_NO_START_SESSION, 'true');

        $this->_attachAjaxJSONResponse($controller);

    }

    protected function _attachAjaxJSONResponse($controller) {


        $message = $this->_checkStatus();

        $controller->getResponse()->clearHeader('Location');

        $controller->getResponse()->setHeader('Content-type', 'application/json', true);

        $message = $this->_reloadHeaderMiniCart($controller, $message);


        $controller->getResponse()->setBody(Mage::helper('core')->jsonEncode($message));

        $this->_setHttpResponseCode($controller , $message['status']);
    }

    protected function _getSession(){
        return Mage::getSingleton('checkout/session');
    }

    protected function _getQuote() {
        return Mage::getSingleton('checkout/cart')->getQuote();
    }


    protected function _getCore() {
        return Mage::getSingleton('core/session');
    }


    protected function _checkStatus() {
        // First Check General Session Messages
        $message = $this->_getSessionMessages();

        // Next Check Quote Messages
        $message = $this->_getQuoteMessages($message);

        // Finally Check Core messages
        return $this->_getCoreMessages($message);

    }

    // Need to check multiple places for error messages
    protected function _getSessionMessages(){

        $cartMessageCollection = $this->_getSession()->getMessages();

        $messages = $cartMessageCollection->getLastAddedMessage();

        $cartMessageCollection->clear();

        $message['status'] = $messages->getType();
        $message['message'] = $messages->getText();
        return $message;
    }

    protected function _getQuoteMessages($currMessage){
        $quote = $this->_getQuote();

        if($quote->getData('has_error')){
            $cartMessages = $this->_getQuote()->getData('messages');

            foreach($cartMessages as $key => $val){
                $currMessage['status'] = $cartMessages[$key]->getType();
                $currMessage['message'] = $cartMessages[$key]->getText();
            }

//            $quote->unsetData('messages');
//            $quote->unsetData('has_error');



        }


        return $currMessage;

    }


    protected function _getCoreMessages($currMessage){

        $coreMessages = $this->_getCore()->getData('messages');

        if($lastMessage = $coreMessages->getLastAddedMessage()){
            $currMessage['status'] = $lastMessage->getType();
            $currMessage['message'] = $lastMessage->getText();
            $coreMessages->clear();
        }


        return $currMessage;
    }




    protected function _setHttpResponseCode($controller, $code) {
        if('success' == $code)
            $controller->getResponse()->setHttpResponseCode(200);
        elseif('error' == $code)
            $controller->getResponse()->setHttpResponseCode(500);
    }

    protected function _reloadHeaderMiniCart($controller, $message){
        $controller->loadLayout();

        $message['content'] = $controller->getLayout()->getBlock('minicart_content')->toHtml();
        return $message;
    }


}