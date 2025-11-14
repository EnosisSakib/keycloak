<?php
/*
Plugin Name: Keycloak Auto Login
Description: Automatically authenticates WordPress users using Keycloak access tokens (via UserInfo endpoint).
Version: 1.0
Author: Nazmus Sakib
*/

add_action('init', 'keycloak_online_authenticate_user');

function keycloak_online_authenticate_user() {

    $token = $_COOKIE['token'] ?? '';

    $api_url = 'http://node-server:3000/currentuser';
    $introspect_url = 'http://192.168.1.40:8080/realms/myrealm/protocol/openid-connect/userinfo';

    $args = [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'timeout' => 10,
    ];

    $response = wp_remote_post($introspect_url, $args);

    if (is_wp_error($response)) {
        wp_logout();
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
   
    if ($code !== 200) {
        wp_logout();
        return;
    }
   
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

     if (!$data || empty($data['email'])) {
        echo 'not a valid user token';
        return;
    }

    
    $email = $data['email'] ?? '';
    $username = $data['preferred_username'] ?? '';
    $roles = $data['realm_access']['roles'] ?? [];




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