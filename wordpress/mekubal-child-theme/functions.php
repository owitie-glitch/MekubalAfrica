<?php
/**
 * Mekubal Africa — full storefront design as a Storefront child theme.
 * Storefront supplies the WooCommerce machinery; these files supply the look.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MEKUBAL_VERSION', '2.6.2' );

/* ------------------------------------------------------------- setup */

add_action( 'after_setup_theme', function () {
	add_theme_support( 'woocommerce' );
	add_theme_support( 'custom-logo', array(
		'height'      => 200,
		'width'       => 400,
		'flex-height' => true,
		'flex-width'  => true,
	) );
	register_nav_menus( array( 'primary' => __( 'Primary Menu', 'mekubal' ) ) );
}, 15 );

/* ------------------------------------------------------------ styles */

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'storefront-parent', get_template_directory_uri() . '/style.css', array(), MEKUBAL_VERSION );
	wp_enqueue_style( 'mekubal-child', get_stylesheet_uri(), array( 'storefront-parent' ), MEKUBAL_VERSION );
	wp_enqueue_style(
		'mekubal-fonts',
		'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600&family=Caveat:wght@600&display=swap',
		array(),
		null
	);
}, 20 );

// The parent theme prints customizer colour CSS that fights this design.
add_filter( 'storefront_customizer_enabled', '__return_false' );

/* -------------------------------------------------------- customizer */

add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_section( 'mekubal', array(
		'title'    => 'Mekubal Africa',
		'priority' => 30,
	) );

	$wp_customize->add_setting( 'mekubal_whatsapp', array(
		'default'           => '254732441905',
		'sanitize_callback' => 'mekubal_sanitize_digits',
	) );
	$wp_customize->add_control( 'mekubal_whatsapp', array(
		'section' => 'mekubal',
		'label'   => 'WhatsApp number (digits only, e.g. 2547...)',
		'type'    => 'text',
	) );

	$wp_customize->add_setting( 'mekubal_hero_image', array(
		'default'           => get_stylesheet_directory_uri() . '/assets/hero.png',
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'mekubal_hero_image', array(
		'section' => 'mekubal',
		'label'   => 'Homepage hero image',
	) ) );
} );

function mekubal_sanitize_digits( $value ) {
	return preg_replace( '/[^0-9]/', '', (string) $value );
}

/* ---------------------------------------------------------- whatsapp */

function mekubal_whatsapp_number() {
	return get_theme_mod( 'mekubal_whatsapp', '254732441905' );
}

function mekubal_whatsapp_link( $text ) {
	return 'https://wa.me/' . mekubal_whatsapp_number() . '?text=' . rawurlencode( $text );
}

/** Enquiry link for a product — names the piece by its photo, like the site. */
function mekubal_product_enquiry_url( $product ) {
	$link = '';
	if ( $product ) {
		$image_id = $product->get_image_id();
		if ( $image_id ) {
			$link = wp_get_attachment_url( $image_id );
		}
		if ( ! $link ) {
			$link = get_permalink( $product->get_id() );
		}
	}
	$message = "Hello! Is product available right now? I'd love to get more details on it. Link: " . $link;
	return mekubal_whatsapp_link( $message );
}

function mekubal_whatsapp_svg() {
	return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>';
}

/* -------------------------------------------------------- woocommerce */

// A blank price means "price on request", exactly like the original site.
add_filter( 'woocommerce_empty_price_html', function () {
	return '<span class="mk-por">Price on request</span>';
} );

// Every product page gets a WhatsApp enquiry button.
add_action( 'woocommerce_single_product_summary', 'mekubal_single_enquiry_button', 35 );
function mekubal_single_enquiry_button() {
	global $product;
	if ( ! $product ) {
		return;
	}
	echo '<a class="mk-whatsapp-btn" target="_blank" rel="noopener" href="'
		. esc_url( mekubal_product_enquiry_url( $product ) ) . '">'
		. mekubal_whatsapp_svg() . 'Enquire on WhatsApp</a>';
}

// Category filter pills above the shop grid — functional filtering without
// any plugin: each pill is a category archive, the current one highlighted.
add_action( 'woocommerce_before_shop_loop', 'mekubal_category_filter_bar', 5 );
function mekubal_category_filter_bar() {
	if ( ! ( is_shop() || is_product_category() ) ) {
		return;
	}
	$cats = get_terms( array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'orderby'    => 'count',
		'order'      => 'DESC',
	) );
	if ( is_wp_error( $cats ) || empty( $cats ) ) {
		return;
	}
	$current = is_product_category() ? get_queried_object_id() : 0;
	echo '<nav class="mk-catbar" aria-label="Product categories">';
	printf(
		'<a class="%s" href="%s">All</a>',
		$current ? '' : 'is-active',
		esc_url( wc_get_page_permalink( 'shop' ) )
	);
	foreach ( $cats as $cat ) {
		printf(
			'<a class="%s" href="%s">%s</a>',
			(int) $current === (int) $cat->term_id ? 'is-active' : '',
			esc_url( get_term_link( $cat ) ),
			esc_html( $cat->name )
		);
	}
	echo '</nav>';
}

// On the shop grid, price-on-request pieces get a WhatsApp enquiry button
// instead of WooCommerce's vague "Read more". Priced products keep their
// normal add-to-cart behaviour.
add_filter( 'woocommerce_loop_add_to_cart_link', 'mekubal_loop_button', 10, 2 );
function mekubal_loop_button( $html, $product ) {
	if ( $product && '' === $product->get_price() ) {
		return '<a class="button mk-loop-enquire" target="_blank" rel="noopener" href="'
			. esc_url( mekubal_product_enquiry_url( $product ) )
			. '">Enquire on WhatsApp</a>';
	}
	return $html;
}

// Shop pages run full-width; the design has no sidebar.
add_filter( 'body_class', function ( $classes ) {
	if ( function_exists( 'is_woocommerce' ) && ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) ) {
		$classes[] = 'storefront-full-width-content';
	}
	return $classes;
} );

/* ------------------------------------------------------------- pages */

// Create the About and Contact pages once, so the nav and footer links have
// somewhere to go. Their design comes from page-about.php / page-contact.php.
add_action( 'init', 'mekubal_ensure_pages' );
function mekubal_ensure_pages() {
	if ( get_option( 'mekubal_pages_created' ) ) {
		return;
	}
	$pages = array(
		'about'   => 'About',
		'contact' => 'Contact',
	);
	foreach ( $pages as $slug => $title ) {
		if ( ! get_page_by_path( $slug ) ) {
			wp_insert_post( array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_name'    => $slug,
				'post_title'   => $title,
				'post_content' => '',
			) );
		}
	}
	update_option( 'mekubal_pages_created', 1 );
}

/* ------------------------------------------------------ menu fallback */

/** Sensible menu before one is built in Appearance → Menus. */
function mekubal_menu_fallback() {
	$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	echo '<ul>';
	printf(
		'<li class="%s"><a href="%s">Home</a></li>',
		is_front_page() ? 'current-menu-item' : '',
		esc_url( home_url( '/' ) )
	);
	printf(
		'<li class="%s"><a href="%s">Shop</a></li>',
		( function_exists( 'is_shop' ) && is_shop() ) ? 'current-menu-item' : '',
		esc_url( $shop )
	);
	foreach ( array( 'about' => 'About', 'contact' => 'Contact' ) as $slug => $label ) {
		$page = get_page_by_path( $slug );
		if ( $page ) {
			printf(
				'<li class="%s"><a href="%s">%s</a></li>',
				is_page( $slug ) ? 'current-menu-item' : '',
				esc_url( get_permalink( $page ) ),
				esc_html( $label )
			);
		}
	}
	echo '</ul>';
}
