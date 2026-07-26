<?php
/**
 * Site footer — centred logo above the Visit / Contact / Browse columns.
 */
?>
</div></div><!-- .col-full / #content -->

<footer class="mk-footer">
	<div class="mk-footer-logo">
		<?php if ( has_custom_logo() ) : ?>
			<?php echo wp_get_attachment_image( get_theme_mod( 'custom_logo' ), 'large', false, array( 'alt' => get_bloginfo( 'name' ) ) ); ?>
		<?php else : ?>
			<img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/logo.png' ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<?php endif; ?>
	</div>

	<div class="mk-footer-cols">
		<div>
			<h4>Visit</h4>
			<p>Westlands Market<br>Shop No. C73<br>Nairobi<br>Kenya</p>
		</div>
		<div>
			<h4>Contact</h4>
			<p>
				<a href="tel:+254732441905">0732 441 905</a><br>
				<a href="mailto:mekubal.africa07@gmail.com">mekubal.africa07@gmail.com</a><br>
				<a href="<?php echo esc_url( mekubal_whatsapp_link( 'Hello Mekubal Africa!' ) ); ?>" target="_blank" rel="noopener">WhatsApp</a>
			</p>
			<p class="mk-small">Monday &ndash; Saturday, 9:00am &ndash; 6:00pm</p>
		</div>
		<div>
			<h4>Browse</h4>
			<p>
				<?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Shop</a><br>
				<?php endif; ?>
				<?php $mk_about = get_page_by_path( 'about' ); ?>
				<?php if ( $mk_about ) : ?>
					<a href="<?php echo esc_url( get_permalink( $mk_about ) ); ?>">About</a><br>
				<?php endif; ?>
				<?php $mk_contact = get_page_by_path( 'contact' ); ?>
				<?php if ( $mk_contact ) : ?>
					<a href="<?php echo esc_url( get_permalink( $mk_contact ) ); ?>">Visit &amp; contact</a><br>
				<?php endif; ?>
				<a href="https://www.instagram.com/mekubal_africa" target="_blank" rel="noopener">@mekubal_africa</a>
			</p>
		</div>
	</div>

	<p class="mk-copyright">&copy; <?php echo esc_html( date_i18n( 'Y' ) ); ?> Mekubal Africa &middot; #wearanafricanstyle</p>
</footer>

</div><!-- #page -->
<?php wp_footer(); ?>
</body>
</html>
