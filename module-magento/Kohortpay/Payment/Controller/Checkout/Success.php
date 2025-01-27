<?php
namespace Kohortpay\Payment\Controller\Checkout;

use Magento\Checkout\Model\Session;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Sales\Api\OrderManagementInterface;

class Success extends Action
{
  /** @var Session */
  private $checkoutSession;

  /**
   * @var OrderManagementInterface
   */
  protected $_order;

  /**
   * @param Context $context
   * @param Session $checkoutSession
   * @param OrderManagementInterface $orderManagementInterface
   */
  public function __construct(
    Context $context,
    Session $checkoutSession,
    OrderManagementInterface $orderManagementInterface
  ) {
    parent::__construct($context);
    $this->checkoutSession = $checkoutSession;
    $this->_order = $orderManagementInterface;
  }

  /**
   * Initialize redirect to bank
   *
   * @return \Magento\Framework\Controller\ResultInterface
   */
  public function execute()
  {
    $order = $this->checkoutSession->getLastRealOrder();

    $this->_redirect('checkout/onepage/success');
  }
}
