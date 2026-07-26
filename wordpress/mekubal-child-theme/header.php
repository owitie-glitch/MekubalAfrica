<?php
/**
 * Site header — logo, page nav, cart and the Shop Now pill.
 * On mobile the nav becomes a right-hand slide-in panel with its own close
 * button and a Shop Now call-to-action at the foot.
 * Keeps Storefront's structural wrappers (#page, #content, .col-full) so the
 * parent's page and WooCommerce templates render inside untouched.
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="hfeed site">

<header class="mk-header">
	<div class="mk-header-inner">
		<a class="mk-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> — home">
			<?php if ( has_custom_logo() ) : ?>
				<?php echo wp_get_attachment_image( get_theme_mod( 'custom_logo' ), 'medium', false, array( 'alt' => get_bloginfo( 'name' ) ) ); ?>
			<?php else : ?>
				<img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/logo.png' ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
			<?php endif; ?>
		</a>

		<nav class="mk-nav" id="mk-nav" aria-label="<?php esc_attr_e( 'Primary', 'mekubal' ); ?>">
			<button class="mk-nav-close" aria-label="<?php esc_attr_e( 'Close menu', 'mekubal' ); ?>">&times;</button>
			<?php
			wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'fallback_cb'    => 'mekubal_menu_fallback',
				'depth'          => 1,
			) );
			?>
			<div class="mk-nav-extra">
				<?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?>
					<a class="mk-pill" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Shop Now <span aria-hidden="true">&rarr;</span></a>
				<?php endif; ?>
				<span class="mk-small">Westlands Market, Shop C73 &middot; Nairobi</span>
			</div>
		</nav>

		<div class="mk-actions">
			<?php if ( function_exists( 'wc_get_cart_url' ) ) : ?>
				<?php $mk_count = ( function_exists( 'WC' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
				<a class="mk-cart" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="<?php esc_attr_e( 'Cart', 'mekubal' ); ?>">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7zM9 7V5a3 3 0 016 0v2"/></svg>
					<?php if ( $mk_count ) : ?><span class="mk-count"><?php echo (int) $mk_count; ?></span><?php endif; ?>
				</a>
				<a class="mk-shopnow" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Shop Now <span aria-hidden="true">&rarr;</span></a>
			<?php endif; ?>
		</div>

		<button class="mk-burger" aria-label="<?php esc_attr_e( 'Open menu', 'mekubal' ); ?>" aria-expanded="false" aria-controls="mk-nav">
			<span></span><span></span>
		</button>
	</div>

	<script>
	(function () {
		var burger = document.querySelector('.mk-burger');
		var nav = document.getElementById('mk-nav');
		if (!burger || !nav) return;
		var closeBtn = nav.querySelector('.mk-nav-close');
		function setOpen(open) {
			nav.classList.toggle('open', open);
			burger.setAttribute('aria-expanded', open ? 'true' : 'false');
			document.documentElement.classList.toggle('mk-noscroll', open);
		}
		burger.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
		if (closeBtn) { closeBtn.addEventListener('click', function () { setOpen(false); }); }
		nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
		document.addEventListener('click', function (e) {
			if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setOpen(false);
		});
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
	})();
	</script>
</header>

<div id="content" class="site-content" tabindex="-1"><div class="col-full">
