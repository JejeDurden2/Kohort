The KohortPay API is organized around [REST](https://). Our API has predictable resource-oriented URLs, accepts application/json or [form-encoded](https://) request bodies, returns [JSON-encoded](https://) responses, and uses standard HTTP response codes, authentication, and verbs.

You can use the KohortPay API in test mode, which doesn't affect your live data or interact with the banking networks. The API key you use to authenticate the request determines whether the request is live mode or test mode.

# Authentification

The KohortPay API uses API keys to authenticate requests. You can view and manage your API keys in the KohortPay Dashboard.

Test mode secret keys have the prefix `sk_test_` and live mode secret keys have the prefix `sk_live_`. Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.

Authentication to the API is performed via [HTTP Basic Auth](https://). Provide your API key as the basic auth username value. You do not need to provide a password. You can also provide your key as a Bearer token.

All API requests must be made over [HTTPS](https://). Calls made over plain HTTP will fail. API requests without authentication will also fail.

# Errors

KohortPay uses conventional HTTP response codes to indicate the success or failure of an API request. In general: Codes in the `2xx` range indicate success. Codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.). Codes in the `5xx` range indicate an error with Kohort's servers (these are rare).

Some `4xx` errors that could be handled programmatically (e.g., a card is [declined](https://)) include an [error code](https://) that briefly explains the error reported.

##### Attributes

- type _string_  
   The type of error returned. One of `api_error` or `invalid_request_error.`
- message _string_  
   A human-readable message providing more details about the error.

# Expanding Responses

Many objects allow you to request additional information as an expanded response by using the `expand` request parameter. This parameter is available on all API requests, and applies to the response of that request only.

In many cases, an object contains the ID of a related object in its response properties. For example, a `Customer` may have an associated `Organization` ID. Those objects can be expanded inline with the `expand` request parameter.

You can use the `expand` param on any list endpoint which returns expandable fields.

You can expand multiple objects at once by identifying multiple items in the `expand` array.

Be aware that using expand will make your queries slower.

# Pagination

All top-level API resources have support for bulk fetches via "list" API methods. These list API methods share a common structure, taking at least these three parameters: `take`, `skip`, and `orderBy`.

The response of a list API method represents a single page in a reverse chronological stream of objects. If you do not specify any parameters, you will receive the first page of this stream, containing the newest objects. The limit of objects you can receive is set to 100.

Along with the data, you will receive `count`to allow you to paginate accordingly.

##### Parameters

- take _number optional_  
   A limit on the number of objects to be returned, must be a positive int. Max 100.
- skip _number optional_  
   The number of objects to skip.
- orderBy _string optional default=createdAt:desc_  
   Object field to sort. Format is `field:asc|desc`. If none of `asc`or `desc` is provided, it will default to `asc`.

# Search

All top-level API resources have support for search via "list" API methods. It allows you to filter your lists on any property of your object.

The search can be used alongside _Pagination_ query parameters (see above) and the response will follow the same pattern.

##### Parameters

- search _string optional_  
   The property and value you want to filter on, separated by `:`. Format is `property:value`. `property` must match an existing property of the object. `value` must exactly match an existing value (case-sensitive). Example: `/customers?search=first_name:Bob` will retrieve all customers with the first name Bob.
