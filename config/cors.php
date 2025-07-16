<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'anonymous-donation/*', 'donor/donations/*'],

    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [
        '*ngrok-free.app',
        '*ngrok.io',
        '*paychangu.com'
    ],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    'supports_credentials' => true,
];
