<?php
/**
 * Mekubal Africa — Storefront child theme.
 * Loads the parent styles, this theme's brand styles, and the brand fonts.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

add_action( 'wp_enqueue_scripts', function () {
	// Parent (Storefront) stylesheet, then this child theme's style.css.
	wp_enqueue_style( 'storefront-parent', get_template_directory_uri() . '/style.css' );
	wp_enqueue_style(
		'mekubal-child',
		get_stylesheet_uri(),
		array( 'storefront-parent' ),
		wp_get_theme()->get( 'Version' )
	);

	// Brand fonts: Archivo (body), Bodoni Moda (headings), Caveat (script).
	wp_enqueue_style(
		'mekubal-fonts',
		'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Caveat:wght@600&display=swap',
		array(),
		null
	);
}, 20 );

// Prices are "on request", so nudge the currency to Kenyan Shillings where a
// price does exist. Safe to remove if you set this in WooCommerce settings.
add_filter( 'woocommerce_currency', function ( $currency ) {
	return $currency ? $currency : 'KES';
} );
