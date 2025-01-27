<?php

namespace Kohortpay\Payment\Model;

/**
 * Pay In Store payment method model
 */
class Payment extends \Magento\Payment\Model\Method\AbstractMethod
{
  /**
   * Payment code
   *
   * @var string
   */
  protected $_code = 'kohortpay';

  protected $_isGateway = true;

  protected $_isOffline = false;

  protected $_minAmount = 50;

  /**
   * Authorizes specified amount.
   *
   * @param InfoInterface $payment
   * @param float         $amount
   *
   * @return $this
   *
   * @throws LocalizedException
   */
  public function authorize(
    \Magento\Payment\Model\InfoInterface $payment,
    $amount
  ) {
    return $this;
  }

  /** Redirect to a payment gateway after place order */
  public function getOrderPlaceRedirectUrl()
  {
    // Get current quote
    //$quote = $this->_checkoutSession->getQuote();

    return 'https://kohortpay.com/pay';
  }
}
