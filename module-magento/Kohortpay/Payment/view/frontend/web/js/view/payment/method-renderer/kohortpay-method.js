define(
    [
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/action/redirect-on-success',
        'mage/url'
    ],
    function (Component, redirectOnSuccessAction, url) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Kohortpay_Payment/payment/kohortpay'
            },
            getDescription: function () {
                return 'Pay with Kohortpay';
            },
            afterPlaceOrder: function () {
                redirectOnSuccessAction.redirectUrl = url.build('kohortpay/checkout/redirect');
                this.redirectAfterPlaceOrder = true;
            },
        });
    }
);