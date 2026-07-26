<?php
/**
 * About page — the story, told in the storefront's own voice.
 * Applies automatically to the page with slug "about".
 */

get_header();

$mk_shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>

<div class="mk-page mk-landing">

	<section class="mk-page-hero">
		<p class="mk-eyebrow">Our story</p>
		<h1 class="mk-h1 mk-h1--page">Every piece carries <span class="mk-accent">the hand that made it.</span></h1>
	</section>

	<section class="mk-about-grid">
		<div class="mk-blob">
			<img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/philosophy.webp' ); ?>" alt="Inside the Mekubal Africa shop">
		</div>
		<div>
			<p>Mekubal Africa began at a single stall in Westlands Market, Nairobi &mdash; a home of luxury built one bead at a time. Today the shop works with beaders, leatherworkers and metalsmiths across Kenya, bringing their work to people who love pieces with a story.</p>
			<p>Every collar, cuff and bangle is strung and stitched by hand. Small variations in colour, spacing and finish are the signature of that work &mdash; no two pieces leave the shop identical.</p>
			<p>Wear an African style &mdash; and carry the hand that made it with you.</p>
			<div class="mk-btn-row">
				<a class="mk-pill" href="<?php echo esc_url( $mk_shop ); ?>">Browse the collection <span aria-hidden="true">&rarr;</span></a>
				<a class="mk-pill mk-pill--olive" href="<?php echo esc_url( mekubal_whatsapp_link( 'Hello Mekubal Africa! I would love to know more about your pieces.' ) ); ?>" target="_blank" rel="noopener">Say hello on WhatsApp</a>
			</div>
		</div>
	</section>

	<section class="mk-values">
		<div>
			<h5>Handcrafted</h5>
			<p>Made by skilled artisans</p>
		</div>
		<div>
			<h5>Sustainable</h5>
			<p>Ethical materials &amp; processes</p>
		</div>
		<div>
			<h5>Authentically African</h5>
			<p>Rooted in culture &amp; tradition</p>
		</div>
		<div>
			<h5>Made with Purpose</h5>
			<p>Beauty that empowers</p>
		</div>
	</section>

</div>

<?php
get_footer();
