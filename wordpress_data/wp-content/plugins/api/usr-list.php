<?php
/*
Plugin Name: JWT User List Display
Description: Display users fetched from Node API using JWT token from cookie. Admin only.
Version: 1.0
Author: Your Name
*/

if (!defined('ABSPATH')) exit; // Prevent direct access

add_shortcode('show_user_list', 'jwt_user_list_shortcode');

function jwt_user_list_shortcode() {
    $token = $_COOKIE['token'] ?? '';
    if (!$token) return '<div class="token-display">No token found in cookies.</div>';

    $api_url = 'http://node-server:3000/users';

    $args = [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'timeout' => 10,
    ];

    $response = wp_remote_get($api_url, $args);

    if (is_wp_error($response)) {
        return '<div class="token-display">API request failed: ' . esc_html($response->get_error_message()) . '</div>';
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (!$data || empty($data['users'])) {
        return '<div class="token-display">No users found or invalid API response.</div>';
    }

    $users = $data['users'];

    ob_start();
    ?>
    <div class="user-list-container" style="padding:20px;">
        <h1 style="font-size:24px; font-weight:bold; margin-bottom:20px;">User Management</h1>
        <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px;">
            <?php foreach ($users as $u): ?>
                <div style="border:1px solid #ddd; border-radius:8px; background:#f9f9f9; padding:15px; transition: box-shadow 0.2s;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                        <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:#ccc; display:flex; align-items:center; justify-content:center;">
                            <img src="<?php echo esc_url("https://api.dicebear.com/9.x/initials/svg?seed=" . ($u['username'] ?? 'user')); ?>" alt="avatar" style="width:100%; height:100%;" />
                        </div>
                        <div>
                            <div style="font-weight:bold;"><?php echo esc_html($u['firstName'] ?? $u['username']); ?> <?php echo esc_html($u['lastName'] ?? ''); ?></div>
                            <div style="font-size:12px; color:#666;"><?php echo esc_html($u['email'] ?? 'No email'); ?></div>
                        </div>
                    </div>
                    <div style="font-size:12px; color:#555; margin-bottom:5px;">
                        Username: <?php echo esc_html($u['username']); ?>
                    </div>
                    <div style="font-size:12px; color:#555; margin-bottom:5px;">
                        Email Verified: <?php echo !empty($u['emailVerified']) ? 'Yes' : 'No'; ?>
                    </div>
                    <div style="font-size:12px; font-weight:bold; color:<?php echo !empty($u['enabled']) ? 'green' : 'red'; ?>;">
                        <?php echo !empty($u['enabled']) ? 'Active' : 'Disabled'; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
