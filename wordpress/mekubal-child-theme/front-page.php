<?php
/**
 * The landing page — arch hero, category tiles, philosophy, gallery,
 * newsletter. A direct port of the original Mekubal Africa storefront.
 */

get_header();

$mk_hero = get_theme_mod( 'mekubal_hero_image', get_stylesheet_directory_uri() . '/assets/hero.png' );
$mk_shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>

<div class="mk-landing">

	<section class="mk-hero">
		<div class="mk-hero-copy">
			<p class="mk-eyebrow">Handcrafted <span class="mk-dot">&bull;</span> African Heritage <span class="mk-dot">&bull;</span> Timeless Design</p>
			<h1 class="mk-h1">Handmade Beauty for <span class="mk-accent">Everyday Living.</span></h1>
			<p class="mk-lede">Beaded collars, brass cuffs and woven pieces &mdash; made by hand by artisans across Kenya, so no two are ever quite alike.</p>
			<a class="mk-pill" href="<?php echo esc_url( $mk_shop ); ?>">Shop Now <span aria-hidden="true">&rarr;</span></a>
		</div>
		<div class="mk-hero-art">
			<div class="mk-arch">
				<img src="<?php echo esc_url( $mk_hero ); ?>" alt="Adornment by Mekubal Africa">
			</div>
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
			<?php $mk_about = get_page_by_path( 'about' ); ?>
			<a class="mk-pill mk-pill--olive" href="<?php echo esc_url( $mk_about ? get_permalink( $mk_about ) : $mk_shop ); ?>">Learn more <span aria-hidden="true">&rarr;</span></a>
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
							<?php echo $mk_product->get_image( 'woocommerce_thumbnail' ); ?>
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
