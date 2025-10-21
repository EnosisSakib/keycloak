<?php
/*
Plugin Name: JWT Profile Display
Description: Reads JWT from cookie, calls API to decode, and displays user info via shortcode [show_token_result].
Version: 1.0
Author: Your Name
*/
if (!defined('ABSPATH')) exit; 

add_shortcode('show_token_result', 'jwt_profile_shortcode');

function jwt_profile_shortcode() {
    $token = $_COOKIE['token'] ?? '';
    if (!$token) return '<div class="token-display">No token found in cookies.</div>';


    $api_url = 'http://node-server:3000/currentuser';

    $args = [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body' => json_encode(['token' => $token]),
        'timeout' => 10,
    ];

    $response = wp_remote_post($api_url, $args);

    if (is_wp_error($response)) {
        return '<div class="token-display">API request failed: ' . esc_html($response->get_error_message()) . '</div>';
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (!$data || empty($data['decodeToken'])) {
        return '<div class="token-display">Invalid API response.</div>';
    }

    $tokenData = $data['decodeToken'];

    $name = $tokenData['name'] ?? '';
    $username = $tokenData['preferred_username'] ?? '';
    $email = $tokenData['email'] ?? '';
    $roles = $tokenData['realm_access']['roles'] ?? [];
    $clientRoles = $tokenData['resource_access'] ?? [];
    $exp = isset($tokenData['exp']) ? date('Y-m-d H:i:s', $tokenData['exp']) : '';


    ob_start();
    ?>
    <div class="token-info" style="border:1px solid #ddd; padding:15px; border-radius:8px; background:#f9f9f9;">
        <p><strong>Name:</strong> <?php echo esc_html($name); ?></p>
        <p><strong>Username:</strong> <?php echo esc_html($username); ?></p>
        <p><strong>Email:</strong> <?php echo esc_html($email); ?></p>
        <p><strong>Roles:</strong> <?php echo esc_html(implode(', ', $roles)); ?></p>
        <?php if (!empty($clientRoles)): ?>
            <p><strong>Client Roles:</strong></p>
            <ul>
            <?php foreach ($clientRoles as $client => $details): ?>
                <li><strong><?php echo esc_html($client); ?>:</strong> <?php echo esc_html(implode(', ', $details['roles'] ?? [])); ?></li>
            <?php endforeach; ?>
            </ul>
        <?php endif; ?>
        <p><strong>Token Expiration:</strong> <?php echo esc_html($exp); ?></p>
    </div>
    <?php
    return ob_get_clean();
}
