<?php
/*
Plugin Name: Redirect WP Login
Description: Redirects WordPress login page to localhost:8090
Version: 1.0
Author: Nazmus Sakib
*/

if (!defined('ABSPATH')) exit; // Exit if accessed directly

add_action('login_init', function() {
    if (!isset($_GET['redirected'])) {
        wp_redirect('http://localhost:8090');
        exit;
    }
});
