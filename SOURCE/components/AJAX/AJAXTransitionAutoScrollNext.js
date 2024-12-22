const AJAXTransitionAutoScrollNext = {
	name: 'autoScrollNext',

	custom: (data) => {
		if (data && data.trigger instanceof HTMLElement) {
			const el = data.trigger.closest('[data-ajax-transition]');

			return el && el.getAttribute('data-ajax-transition') === AJAXTransitionAutoScrollNext.name;
		} else {
			return false;
		}
	},

	before: (data) => {
		return AJAXLifecycle.startTransition(data);
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.buildContainersDOM(data)
				.then(() => AJAXLifecycle.loadOnlyFirstComponent(data))
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	},

	enter: (data) => {
		return AJAXLifecycle.initNewPageFlyingImageBefore(data);
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
					AJAXSeamless.setCanvas(canvas)
						.then(() => AJAXAnimations.hideContent(data))
						.then(() => AJAXHelpers.resetScrollPosition())
						.then(() => AJAXSeamless.loadWebGLPlane(data, {
							canvas,
							nextElement,
							nextElementMedia
						}))
						.then(() => Promise.all([
							AJAXSeamless.translateWebGLPlane(data, {
								duration,
								ease,
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
				} else { // Image -> Image transition
					const currentElement = data.trigger.closest('[data-post-id]').querySelector('.js-ajax-transition-element');

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
