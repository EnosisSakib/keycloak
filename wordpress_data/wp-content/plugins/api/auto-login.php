<?php
/*
Plugin Name: Keycloak Auto Login
Description: Automatically authenticates WordPress users using Keycloak access tokens (via UserInfo endpoint).
Version: 1.0
Author: Nazmus Sakib
*/

add_action('init', 'keycloak_online_authenticate_user');

function keycloak_online_authenticate_user() {


    if (is_user_logged_in()) {
        return;
    }

    $token = $_COOKIE['token'] ?? '';

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
        error_log('Keycloak verify failed: ' . $response->get_error_message());
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code !== 200) {

        error_log('Keycloak verification returned status ' . $code);
        return;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

     if (!$data || empty($data['decodeToken'])) {
        return;
    }
    $tokenData = $data['decodeToken'];
    
    $email = $tokenData['email'] ?? '';
    $username = $tokenData['preferred_username'] ?? '';
    $roles = $tokenData['realm_access']['roles'] ?? [];


    $user = get_user_by('email', $email);


    if (!$user) {
        $random_password = wp_generate_password(10, false);
        $user_id = wp_create_user($username, $random_password, $email);
        wp_update_user([
            'ID' => $user_id,
            'display_name' => $name,
        ]);
        $user = get_user_by('id', $user_id);
    }


    $wp_role = 'subscriber'; 


    if (!empty($roles) && is_array($roles)) {
        if (in_array('admin', $roles)) {
        $wp_role = 'administrator';
        } elseif (in_array('editor', $roles)) {
            $wp_role = 'editor';
        } elseif (in_array('author', $roles)) {
            $wp_role = 'author';
        } elseif (in_array('contributor', $roles)) {
            $wp_role = 'contributor';
        }
    }
    $user->set_role($wp_role);


    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID);
}