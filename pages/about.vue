<template>
	<div class="about-page">
		<header>
			<div class="left">
				<h1 class="title">
					<a href="#">Batoru</a>
				</h1>
			</div>
			<div class="right">
				<a href="/">Play Now!</a>
			</div>
		</header>
		<main>
			<h2>Tagline</h2>
			<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
			sed diam nonummy nibh euismod tincidunt ut laoreet dolore
			magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
			quis nostrud exerci tation ullamcorper suscipit lobortis nisl
			ut aliquip ex ea commodo consequat. Duis autem vel eum iriure
			dolor in hendrerit in vulputate velit esse molestie consequat,
			vel illum dolore eu feugiat nulla facilisis at vero eros et
			accumsan et iusto odio dignissim qui blandit praesent luptatum
			zzril delenit augue duis dolore te feugait nulla facilisi.
			Nam liber tempor cum soluta nobis eleifend option congue
			nihil imperdiet doming id quod mazim placerat facer possim
			assum. Typi non habent claritatem insitam; est usus legentis
			in iis qui facit eorum claritatem. Investigationes
			demonstraverunt lectores legere me lius quod ii legunt saepius.
			Claritas est etiam processus dynamicus, qui sequitur mutationem
			consuetudium lectorum. Mirum est notare quam littera gothica,
			quam nunc putamus parum claram, anteposuerit litterarum formas
			humanitatis per seacula quarta decima et quinta decima. Eodem
			modo typi, qui nunc nobis videntur parum clari, fiant sollemnes
			in futurum.</p>
			<img alt="placeholder" src="https://cdn.discordapp.com/attachments/201382714614611968/450313412673536000/image.jpg" width="150"></img>
			<p>etc</p>
		</main>
		<footer>
			<p>&copy; 2018 some people</p>
		</footer>
	</div>
</template>
<style>
body {
	margin: 0;
	font-family: sans-serif;
}

header {
	grid-area: header;
	flex: 0 0 auto;
	background: #F7F7F7;
	border-bottom: 1px solid #BBB;
	padding: 0 10px;
	display: flex;
	line-height: 32px;
	justify-content: space-between;
}
header .left {
	/*display: flex;*/
}
header .title {
	margin: 0;
	font-size: inherit;
}
header .title a {
	color: inherit;
	text-decoration: inherit;
}

main {
	max-width: 800px;
	margin: 0 auto;
	padding: 0 20px;
}

main img {
	max-width: 100%;
	display: block;
	margin: 0 auto;
}

footer {
	background: #F7F7F7;
	border-top: 1px solid #BBB;
	padding: 10px;
	color: rgba(0,0,0,0.7);
}
footer * {
	max-width: 800px;
	margin-left: auto;
	margin-right: auto;
}

</style>