const AJAXTransitionFlyingImage = {
	name: 'flyingImage',

	custom: (data) => {
		if (data && data.trigger instanceof HTMLElement) {
			const el = data.trigger.closest('[data-ajax-transition]');

			return el && el.getAttribute('data-ajax-transition') === AJAXTransitionFlyingImage.name;
		} else {
			return false;
		}
	},

	before: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.startTransition(data)
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.buildContainersDOM(data)
				.then(() => AJAXLifecycle.loadOnlyFirstComponent(data))
				.then(() => {
					AJAXHelpers.resolveOnNextTick(resolve)
				});
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.initNewPageFlyingImageBefore(data)
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			let
				duration = AJAXHelpers.getTransitionDuration(),
				ease = AJAXHelpers.getTransitionEase(),
				{ nextElement, nextElementMedia } = AJAXSeamless.getNextMediaElements(data);

			if (nextElement && nextElementMedia) {
				const canvas = AJAXSeamless.getWebGLTransitionContainer(data);
				const AJAXRef = app.componentsManager.getComponentByName('AJAX');

				AJAXRef.runningSeamlessTransition = true;

				// WebGL -> Image transition
				if (canvas) {
					const
						container = canvas.closest('.has-curtains') || canvas,
						translateY = gsap.getProperty(canvas, 'y', 'px'),
						translateYParsed = typeof translateY === 'string' ? parseFloat(translateY) : 0,
						rect = container.getBoundingClientRect(),
						scrollY = window.scrollY;
					// Scroll to canvas view first
					if (parseInt(scrollY) !== parseInt(rect.top)) {
						app.utilities.scrollLock(false);

						app.utilities.scrollTo({
							target: container,
							duration: 0.6,
							offset: -translateYParsed,
							cb: () => {
								AJAXSeamless.setCanvas(canvas)
								.then(() => AJAXAnimations.hideContent(data))
								.then(() => AJAXSeamless.loadWebGLPlane(data, {
									canvas,
									nextElement,
									nextElementMedia
								}))
								.then((e) => Promise.all([
									// app.utilities.scrollLock(true),
	
									AJAXSeamless.translateWebGLPlane(data, {
										duration,
										ease,
										offsetTop: scrollY + rect.top,
										canvas,
										nextElement,
										nextElementMedia
									}),
									AJAXAnimations.animateContainers(data, {
										duration,
										ease
									})
								]))
								.then(() => AJAXHelpers.resetScrollPosition())
								.then(() => AJAXHelpers.resolveOnNextTick(resolve));
							}
						})
					} else {
						AJAXSeamless.setCanvas(canvas)
							.then(() => AJAXAnimations.hideContent(data))
							.then(() => AJAXHelpers.resetScrollPosition())
							.then(() => AJAXSeamless.loadWebGLPlane(data, {
								canvas,
								nextElement,
								nextElementMedia
							}))
							.then((e) => Promise.all([
								AJAXSeamless.translateWebGLPlane(data, {
									duration,
									ease,
									offsetTop: scrollY + rect.top,
									canvas,
									nextElement,
									nextElementMedia
								}),
								AJAXAnimations.animateContainers(data, {
									duration,
									ease
								})
							]))
							.then(() => AJAXHelpers.resolveOnNextTick(resolve));
					}
				} else { // Image -> Image transition
					const { currentElement } = AJAXSeamless.getCurrentMediaElements(data);

					AJAXSeamless.cloneMedia({ currentElement, nextElement })
						.then(({ cloneElement, nextElement }) => {
							if (cloneElement && nextElement) {
								AJAXAnimations.hideContent(data)
									.then(() => AJAXHelpers.resetScrollPosition())
									.then(() => Promise.all([
										AJAXAnimations.animateMedia({
											duration,
											ease,
											cloneElement,
											nextElement
										}),
										AJAXAnimations.animateContainers(data, { duration, ease })
									]))
									.then(() => AJAXHelpers.resolveOnNextTick(resolve));
							} else {
								AJAXAnimations.animateCurtains(data, { duration, ease })
									.then(() => AJAXHelpers.resetScrollPosition())
									.then(() => AJAXHelpers.resolveOnNextTick(resolve));
							}
						});

				}
			} else { // No target media
				AJAXAnimations.hideContent(data)
					.then(() => AJAXHelpers.resetScrollPosition())
					.then(() => AJAXAnimations.animateCurtains(data, { duration, ease }))
					.then(() => AJAXHelpers.resolveOnNextTick(resolve));
			}
		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.initNewPageFlyingImageAfter(data)
				.then(() => AJAXLifecycle.loadRestComponents(data))
				.then(() => AJAXLifecycle.endTransition(data))
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	}
}
