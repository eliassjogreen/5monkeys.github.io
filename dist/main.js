(function() {
	var canvas = document.querySelector("#bananas");
	if (!canvas) return;

	var image = "";
	var settings = {
		canvasSize: {
			x: 0,
			y: 0,
		},
		areaPadding: 100, // threshold for killing and spawning bananas
		image_url: "img/banan.png",
		particles: 50,
		center: { x: 0, y: 0 },
		render: false,
		cancelRender: false,
		globalAlpha: 0,
		gravity: 1.5,
		wind: 0,
		friction: 0,
		turbulence: 0,
	};

	var particles = [];
	var ctx;

	function setupCanvas() {
		window.addEventListener("resize", function() {
			updateCanvasSize();
		});

		var gasell = document.querySelector(".gasell");
		gasell.addEventListener("mouseleave", function() {
			settings.globalAlpha = 0;
		});

		gasell.addEventListener("mouseenter", function() {
			settings.globalAlpha = 1;
		});

		updateCanvasSize();
		ctx = canvas.getContext("2d");

		for (var i = 0; i < settings.particles; ++i) {
			particles.push({
				x: randomRange(
					0 - settings.areaPadding,
					canvas.width + settings.areaPadding,
				),
				y: randomRange(
					0 - settings.areaPadding,
					canvas.height + settings.areaPadding,
				),
				w: randomRange(50, 100),
				vy: randomRange(0.5, 1),
				vx: randomRange(-0.1, 0.3),
				rotation: randomRange(0, 6.283185),
				rotationSpeed: randomRange(-0.004, 0.004),
				scale: randomRange(0.2, 1),
				flipped: Math.random() > 0.5 ? 1 : -1,
			});
		}

		createImage();
	}

	function renderBananas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = settings.globalAlpha;
		for (var i = 0; i < particles.length; ++i) {
			var p = particles[i];

			var size = p.w * (p.scale * p.flipped);
			var adjustedX = p.x - size / 2;
			var adjustedY = p.y - size / 2;
			ctx.save();
			ctx.translate(adjustedX, adjustedY);
			ctx.rotate(p.rotation);
			ctx.drawImage(image, 0, 0, size, size);
			ctx.restore();
		}
	}

	function maybeRecycleBanana(p) {
		// invisible on X
		if (
			p.x < 0 - p.w - settings.areaPadding ||
			p.x > canvas.width + p.w + settings.areaPadding
		) {
			p.x = randomRange(0, canvas.width);
			p.y = 0 - settings.areaPadding;
		}

		// invisible on Y
		if (
			p.y < 0 - p.w - settings.areaPadding ||
			p.y > canvas.height + p.w + settings.areaPadding
		) {
			p.y = 0 - settings.areaPadding;
		}
	}

	function recalculateBananas() {
		particles.map(function(p) {
			maybeRecycleBanana(p);

			// apply friction to make sure vx and vy does not affect object indefinately
			if (settings.friction !== 0) {
				p.vx = p.vx > 0 ? p.vx - settings.friction : p.vx;
				p.vy = p.vy > 0 ? p.vy - settings.friction : p.vy;
				// p.rotationSpeed = p.rotationSpeed >= 0 ? p.rotationSpeed - settings.friction : p.rotationSpeed;
			}

			// p.vy = mapRange(p.y, 0, settings.canvasSize.y, 0, 1.1);

			// recalculate speed along axis based on turbulence, if 0 this is useless.
			if (settings.turbulence !== 0) {
				p.vy =
					p.vy *
					randomRange(
						1 - settings.turbulence,
						1 + settings.turbulence,
					);

				p.vx =
					p.vx *
					randomRange(
						1 - settings.turbulence,
						1 + settings.turbulence,
					);
			}

			p.y += p.vy + p.vy * settings.gravity;
			p.x += p.vx + p.vx * settings.wind;
			p.rotation += p.rotationSpeed * p.flipped;
		});

		renderBananas();
	}

	function startBananas() {
		recalculateBananas();

		if (!settings.render) return;

		window.requestAnimationFrame(function() {
			startBananas();
		});
	}

	function createImage() {
		image = new Image();
		image.onload = startBananas;
		image.src = settings.image_url;
	}

	function cancelRender() {
		settings.render = false;
	}

	function resumeRender() {
		settings.render = true;
	}

	function updateCanvasSize(initialSetup) {
		if (settings.render) cancelRender();

		var oldCanvasSize = settings.canvasSize;

		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		settings.center.x = canvas.width / 2;
		settings.center.y = canvas.height / 2;
		settings.canvasSize = {
			y: canvas.height,
			x: canvas.width,
		};

		// probably overkill. But if the canvas is resized, smoothly remap all the particles to a new,
		// corresponding spot on the newly sized canvas.
		if (!initialSetup) {
			particles.map(function(p) {
				p.x = mapRange(
					p.x,
					0 - settings.areaPadding,
					oldCanvasSize.x + settings.areaPadding,
					0 - settings.areaPadding,
					settings.canvasSize.x + settings.areaPadding,
				);
				p.y = mapRange(
					p.y,
					0 - settings.areaPadding,
					oldCanvasSize.y + settings.areaPadding,
					0 - settings.areaPadding,
					settings.canvasSize.y + settings.areaPadding,
				);
			});
		}

		resumeRender();
	}

	setupCanvas();
})();

function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}

function mapRange(value, x1, y1, x2, y2) {
	return x2 + ((y2 - x2) * (value - x1)) / (y1 - x1);
}
