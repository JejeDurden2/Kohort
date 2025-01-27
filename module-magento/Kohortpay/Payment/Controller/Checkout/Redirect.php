<?php
namespace Kohortpay\Payment\Controller\Checkout;

use Magento\Checkout\Model\Session;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Sales\Model\Order;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\State;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Locale\Resolver;

use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Client;

class Redirect extends Action
{
  /** @var Session */
  private $checkoutSession;

  /**
   * @var ScopeConfigInterface
   */
  private $scopeConfig;

  /**
   * @var State
   */
  private $state;

  /**
   * @var UrlInterface
   */
  private $urlInterface;

  /**
   * @var StoreManagerInterface
   */
  private $_storeManager;

  /**
   * @var Resolver
   */
  private $localeResolver;

  /**
   * @param Context $context
   * @param Session $checkoutSession
   * @param ScopeConfigInterface $scopeConfig
   * @param State $state
   * @param UrlInterface $urlInterface
   * @param StoreManagerInterface $storeManager
   */
  public function __construct(
    Context $context,
    Session $checkoutSession,
    ScopeConfigInterface $scopeConfig,
    State $state,
    UrlInterface $urlInterface,
    StoreManagerInterface $storeManager,
    Resolver $localeResolver
  ) {
    parent::__construct($context);
    $this->checkoutSession = $checkoutSession;
    $this->scopeConfig = $scopeConfig;
    $this->state = $state;
    $this->urlInterface = $urlInterface;
    $this->_storeManager = $storeManager;
    $this->localeResolver = $localeResolver;
  }

  /**
   * Initialize redirect to bank
   *
   * @return \Magento\Framework\Controller\ResultInterface
   */
  public function execute()
  {
    var_dump($this->getCheckoutSessionJson());
    die();

    $client = new Client();

    // Get Magento configuration payment/kohortpay/merchant_key
    $merchantKey = $this->scopeConfig->getValue(
      'payment/kohortpay/merchant_key',
      \Magento\Store\Model\ScopeInterface::SCOPE_STORE
    );

    try {
      $response = $client->post('https://api.kohortpay.com/checkout-sessions', [
        'headers' => [
          'Authorization' => 'Bearer ' . $merchantKey,
        ],
        'json' => $this->getCheckoutSessionJson(),
      ]);
      $checkoutSession = json_decode($response->getBody()->getContents(), true);
      if (isset($checkoutSession['url'])) {
        /** @var \Magento\Framework\Controller\Result\Redirect $resultRedirect */
        $resultRedirect = $this->resultFactory->create(
          ResultFactory::TYPE_REDIRECT
        );
        $resultRedirect->setUrl($checkoutSession['url']);

        return $resultRedirect;
      }
    } catch (ClientException $e) {
      if ($this->state->getMode() === State::MODE_DEVELOPER) {
        var_dump($this->getCheckoutSessionJson());
      }
      if ($e->hasResponse()) {
        $errorResponse = json_decode(
          $e
            ->getResponse()
            ->getBody()
            ->getContents(),
          true
        );
        if (isset($errorResponse['error']['message'])) {
          var_dump($errorResponse['error']['message']);
        }
      }
    }
  }

  /**
   * Build and get checkout session JSON object to send to the API.
   */
  protected function getCheckoutSessionJson()
  {
    $order = $this->checkoutSession->getLastRealOrder();

    // Customer information
    $json['customerFirstName'] = $order->getCustomerFirstname();
    $json['customerLastName'] = $order->getCustomerLastname();
    $json['customerEmail'] = $order->getCustomerEmail();

    // Success & cancel URLs
    $json['successUrl'] = $this->urlInterface->getUrl(
      'kohortpay/checkout/success'
    );
    $json['cancelUrl'] = $this->urlInterface->getUrl(
      'kohortpay/checkout/cancel'
    );

    // Locale & currency
    $json['locale'] = $this->localeResolver->getLocale();
    $json['currency'] = $order->getOrderCurrencyCode();

    // Order information
    $json['amountTotal'] = $this->cleanPrice($order->getGrandTotal());

    // Line items
    $json['lineItems'] = [];
    // Products
    foreach ($order->getAllVisibleItems() as $product) {
      $json['lineItems'][] = [
        'name' => $this->cleanString($product->getName()),
        'description' => $this->cleanString($product->getDescription()),
        'price' => $this->cleanPrice($product->getPrice()),
        'quantity' => $product->getQtyOrdered(),
        'type' => 'PRODUCT',
        'image_url' =>
          $this->_storeManager
            ->getStore()
            ->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA) .
          'catalog/product' .
          $product->getProduct()->getImage(),
      ];
    }

    // Discounts
    $json['lineItems'][] = [
      'name' => $this->cleanString($order->getDiscountDescription()),
      'price' => $this->cleanPrice($order->getDiscountAmount()),
      'quantity' => 1,
      'type' => 'DISCOUNT',
    ];

    // Shipping
    $json['lineItems'][] = [
      'name' => $this->cleanString($order->getShippingDescription()),
      'price' => $this->cleanPrice($order->getShippingAmount()),
      'quantity' => 1,
      'type' => 'SHIPPING',
    ];

    // Metadata
    $json['metadata'] = [
      'quote_id' => $order->getQuoteId(),
      'order_id' => $order->getIncrementId(),
      'customer_id' => $order->getCustomerId(),
    ];

    return $json;
  }

  /**
   * Clean string to avoid XSS.
   */
  protected function cleanString($string)
  {
    $string = !$string ? '' : strip_tags($string);

    return $string;
  }

  /**
   * Clean price to avoid price with more than 2 decimals.
   */
  protected function cleanPrice($price)
  {
    $price = round($price, 2);
    $price = $price * 100;

    return $price;
  }
}
