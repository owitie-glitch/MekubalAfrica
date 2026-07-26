<?php
/**
 * The landing page — dark heritage edition. Gold accents on near-black,
 * the portrait blended into the ground, then category tiles, philosophy,
 * gallery and newsletter. Scoped dark styling lives under body.home.
 */

get_header();

$mk_hero = get_theme_mod( 'mekubal_hero_image', get_stylesheet_directory_uri() . '/assets/hero.png' );
$mk_hero = add_query_arg( 'v', MEKUBAL_VERSION, $mk_hero ); // cache-bust on theme updates
$mk_shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
$mk_about = get_page_by_path( 'about' );
$mk_about_url = $mk_about ? get_permalink( $mk_about ) : $mk_shop;
?>

<div class="mk-landing">

	<section class="mk-hero">
		<div class="mk-hero-copy">
			<p class="mk-eyebrow">Rooted in culture. Made to empower.</p>
			<h1 class="mk-h1">Celebrate<br>Your Heritage</h1>
			<p class="mk-lede">Timeless pieces that honor African tradition and elevate modern elegance.</p>

			<div class="mk-btn-row">
				<a class="mk-cta mk-cta--gold" href="<?php echo esc_url( $mk_shop ); ?>">Shop Collection</a>
				<a class="mk-cta mk-cta--ghost" href="<?php echo esc_url( $mk_about_url ); ?>">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none"/></svg>
					Our Story
				</a>
			</div>

			<div class="mk-feats">
				<div class="mk-feat">
					<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4S9 3 6 9c-2.5 5 1 9 1 9s7 1 10-4c2-3.3 3-10 3-10zM7 18C10 12 15 9 18 8"/></svg>
					<h5>Ethically Made</h5>
					<p>Sustainable materials and fair trade</p>
				</div>
				<div class="mk-feat">
					<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V6a1.5 1.5 0 013 0v4m0-1a1.5 1.5 0 013 0v2m0-1a1.5 1.5 0 013 0v4a6 6 0 01-6 6h-1.7a4 4 0 01-2.9-1.2L5 15.5a1.6 1.6 0 012.3-2.2L9 15"/></svg>
					<h5>Handcrafted</h5>
					<p>By skilled artisans across Africa</p>
				</div>
				<div class="mk-feat">
					<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>
					<h5>Global Impact</h5>
					<p>Preserving culture, empowering communities</p>
				</div>
			</div>
		</div>

		<div class="mk-hero-photo">
			<img src="<?php echo esc_url( $mk_hero ); ?>" alt="Adornment by Mekubal Africa">
			<span class="mk-hero-fade" aria-hidden="true"></span>
		</div>
	</section>

	<?php
	if ( taxonomy_exists( 'product_cat' ) ) {
		$mk_cats = get_terms( array(
			'taxonomy'   => 'product_cat',
			'number'     => 3,
			'hide_empty' => true,
			'orderby'    => 'count',
			'order'      => 'DESC',
		) );
		if ( ! is_wp_error( $mk_cats ) && ! empty( $mk_cats ) ) {
			$mk_tiles = array( 'mk-tile--rust', 'mk-tile--clay', 'mk-tile--olive' );
			?>
			<section class="mk-tiles">
				<?php foreach ( $mk_cats as $mk_i => $mk_cat ) : ?>
					<a class="mk-tile <?php echo esc_attr( $mk_tiles[ $mk_i % 3 ] ); ?>" href="<?php echo esc_url( get_term_link( $mk_cat ) ); ?>">
						<span class="mk-tile-num">0<?php echo (int) ( $mk_i + 1 ); ?></span>
						<span>
							<span class="mk-tile-title"><?php echo esc_html( $mk_cat->name ); ?></span>
							<span class="mk-tile-cta">Explore <span aria-hidden="true">&rarr;</span></span>
						</span>
					</a>
				<?php endforeach; ?>
			</section>
			<?php
		}
	}
	?>

	<section class="mk-philosophy">
		<div class="mk-blob">
			<img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/philosophy.webp' ); ?>" alt="Inside the Mekubal Africa workshop">
		</div>
		<div>
			<h2>Every piece carries the hand that made it.</h2>
			<p>Mekubal Africa works with beaders and metalworkers across Kenya. Every collar, cuff and bangle is strung and stitched by hand, one bead at a time.</p>
			<p>Small variations in colour, spacing and finish are the signature of that work &mdash; no two pieces leave the shop identical.</p>
			<a class="mk-cta mk-cta--ghost" href="<?php echo esc_url( $mk_about_url ); ?>">Learn more <span aria-hidden="true">&rarr;</span></a>
		</div>
	</section>

	<?php
	if ( function_exists( 'wc_get_products' ) ) {
		$mk_products = wc_get_products( array(
			'limit'   => 8,
			'orderby' => 'date',
			'order'   => 'DESC',
			'status'  => 'publish',
		) );
		if ( ! empty( $mk_products ) ) {
			?>
			<section class="mk-gallery">
				<div class="mk-gallery-head">
					<h2>Gallery</h2>
					<a class="mk-viewall" href="<?php echo esc_url( $mk_shop ); ?>">View all &rarr;</a>
				</div>
				<div class="mk-gallery-grid">
					<?php foreach ( $mk_products as $mk_product ) : ?>
						<a class="mk-card" href="<?php echo esc_url( get_permalink( $mk_product->get_id() ) ); ?>">
							<?php echo $mk_product->get_image( 'large' ); ?>
							<span class="mk-card-title"><?php echo esc_html( $mk_product->get_name() ); ?></span>
							<span class="mk-card-price"><?php echo wp_kses_post( $mk_product->get_price_html() ); ?></span>
						</a>
					<?php endforeach; ?>
				</div>
			</section>
			<?php
		}
	}
	?>

	<section class="mk-news">
		<div>
			<h2>Stay in the loop.</h2>
			<p>New pieces land often and the best ones go fast. Leave your email and we&rsquo;ll send word when fresh work arrives.</p>
		</div>
		<div>
			<form class="mk-news-form" onsubmit="location.href='mailto:mekubal.africa07@gmail.com?subject=Mekubal updates&amp;body='+encodeURIComponent(this.email.value);return false;">
				<input type="email" name="email" required placeholder="Type your email" aria-label="Email address">
				<button type="submit" aria-label="Subscribe">&rarr;</button>
			</form>
			<p class="mk-news-alt">Or say hello on <a href="<?php echo esc_url( mekubal_whatsapp_link( 'Hello Mekubal Africa! Please add me to your updates.' ) ); ?>" target="_blank" rel="noopener">WhatsApp</a>.</p>
		</div>
	</section>

</div>

<?php
get_footer();
