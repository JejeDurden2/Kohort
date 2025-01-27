define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/payment/renderer-list'
    ],
    function (
        Component,
        rendererList
    ) {
        'use strict';
        rendererList.push(
            {
                type: 'kohortpay',
                component: 'Kohortpay_Payment/js/view/payment/method-renderer/kohortpay-method'
            }
        );
        return Component.extend({});
    }
);