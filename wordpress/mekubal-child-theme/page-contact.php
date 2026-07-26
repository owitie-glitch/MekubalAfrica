<?php
/**
 * Contact page — visit details, WhatsApp, hours and the map.
 * Applies automatically to the page with slug "contact".
 */

get_header();
?>

<div class="mk-page mk-landing">

	<section class="mk-page-hero">
		<p class="mk-eyebrow">Visit &amp; contact</p>
		<h1 class="mk-h1 mk-h1--page">Come see the work <span class="mk-accent">up close.</span></h1>
	</section>

	<section class="mk-contact-grid">
		<div class="mk-contact-info">
			<h4>Visit</h4>
			<p>Westlands Market<br>Shop No. C73<br>Nairobi, Kenya</p>
			<p><a class="mk-textlink" href="https://www.google.com/maps/search/?api=1&amp;query=Westlands%20Market%2C%20Nairobi%2C%20Kenya" target="_blank" rel="noopener">Get directions &rarr;</a></p>

			<h4>Talk to us</h4>
			<p>
				<a href="tel:+254732441905">0732 441 905</a><br>
				<a href="mailto:mekubal.africa07@gmail.com">mekubal.africa07@gmail.com</a><br>
				<a href="https://www.instagram.com/mekubal_africa" target="_blank" rel="noopener">@mekubal_africa</a>
			</p>
			<a class="mk-pill" href="<?php echo esc_url( mekubal_whatsapp_link( 'Hello Mekubal Africa!' ) ); ?>" target="_blank" rel="noopener">Chat on WhatsApp</a>

			<h4>Hours</h4>
			<p>Monday &ndash; Saturday: 9:00am &ndash; 6:00pm<br>Sunday: Closed</p>
		</div>

		<div class="mk-map">
			<iframe
				title="Map to Westlands Market, Nairobi"
				src="https://maps.google.com/maps?q=Westlands%20Market%2C%20Nairobi%2C%20Kenya&amp;z=16&amp;output=embed"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				allowfullscreen></iframe>
		</div>
	</section>

</div>

<?php
get_footer();
