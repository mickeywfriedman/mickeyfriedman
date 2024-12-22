class AJAXSeamless {
	static getCurrentMediaElements(data) {
		const result = {
			currentElement: null,
			currentElementMedia: null
		},
			postIDElement = data.trigger.closest('[data-post-id]'),
			postID = postIDElement ? postIDElement.getAttribute('data-post-id') : null;

		let currentElement = data.trigger.querySelector('.js-ajax-transition-element');

		// Look up transition elements
		// inside the clicked link element
		if (!currentElement) {
			const outerWrapper = data.trigger.closest('[data-post-id]');

			if (outerWrapper) {
				currentElement = outerWrapper.querySelector('.js-ajax-transition-element');
			}
		}

		// Look up sibling transition elements
		// of the same post id
		if (!currentElement && postID) {
			const outerContainer = data.trigger.closest('[data-ajax-transition]');
			if (outerContainer) {
				const siblings = [...outerContainer.querySelectorAll(`[data-post-id="${postID}"]`)];

				if (siblings.length) {
					siblings.forEach((el) => {
						// Self is the transition element
						if (el.classList.contains('js-ajax-transition-element')) {
							currentElement = el;
						} else {
							// Look up inner transition element
							const siblingImage = el.querySelector('.js-ajax-transition-element');

							if (siblingImage) {
								currentElement = siblingImage;
							}
						}
					});
				}
			}
		}

		if (currentElement) {
			result.currentElement = currentElement;

			const videoMediaElement = currentElement.querySelector('video.js-ajax-transition-element__media');

			if (videoMediaElement) {
				result.currentElementMedia = videoMediaElement;
			} else {
				const imageMediaElement = currentElement.querySelector('img.js-ajax-transition-element__media');

				if (imageMediaElement) {
					result.currentElementMedia = imageMediaElement;
				}
			}
		}
		return result;
	}

	static getNextMediaElements(data) {
		const result = {
			nextElement: null,
			nextElementMedia: null
		};

		const nextElement = data.next.container.querySelector('.masthead .js-ajax-transition-element');

		if (nextElement) {
			result.nextElement = nextElement;

			const videoMediaElement = nextElement.querySelector('video.js-ajax-transition-element__media');

			if (videoMediaElement) {
				result.nextElementMedia = videoMediaElement;
			} else {
				const imageMediaElement = nextElement.querySelector('img.js-ajax-transition-element__media');

				if (imageMediaElement) {
					result.nextElementMedia = imageMediaElement;
				}
			}
		}

		return result;
	}

	static getWebGLTransitionContainer(data) {
		const outerContainer = data.trigger.closest('.has-curtains');

		if (outerContainer) {
			return outerContainer.querySelector('.canvas-wrapper');
		}

		return null;
	}

	static loadWebGLPlane(data, { canvas, nextElement, nextElementMedia } = {}) {
		return new Promise((resolve) => {
			if (canvas instanceof HTMLElement) {
				const event = new CustomEvent('loadPlane', {
					detail: {
						trigger: data.trigger,
						nextElement,
						nextElementMedia,
						callback: () => AJAXHelpers.resolveOnNextTick(resolve)
					}
				});

				canvas.dispatchEvent(event);
			} else {
				AJAXHelpers.resolveOnNextTick(resolve);
			}
		});
	}

	static translateWebGLPlane(data, { duration, ease, offsetTop, canvas, nextElement, nextElementMedia } = {}) {
		return new Promise((resolve) => {
			if (canvas instanceof HTMLElement) {
				const nextOverlayEl = nextElement.querySelector('.js-ajax-transition-element__overlay');

				gsap.set(nextElement, {
					autoAlpha: 0
				});

				// if (nextOverlayEl) {
				// 	const
				// 		cloneOverlay = nextOverlayEl.cloneNode(true),
				// 		opacity = gsap.getProperty(nextOverlayEl, 'opacity');

				// 	gsap.set(cloneOverlay, {
				// 		autoAlpha: 0
				// 	});

				// 	canvas.appendChild(cloneOverlay);

				// 	gsap.to(cloneOverlay, {
				// 		duration,
				// 		ease,
				// 		autoAlpha: opacity
				// 	});
				// }

				const event = new CustomEvent('translatePlane', {
					detail: {
						duration,
						ease,
						offsetTop: typeof offsetTop === 'function' ? offsetTop() : offsetTop,
						trigger: data.trigger,
						nextElement,
						nextElementMedia,
						callback: () => {
							gsap.set(nextElement, {
								clearProps: 'opacity,visibility'
							});

							AJAXHelpers.resetScrollPosition()
								.then(() => AJAXHelpers.resolveOnNextTick(resolve));
						}
					}
				});

				canvas.dispatchEvent(event);
			} else {
				AJAXHelpers.resolveOnNextTick(resolve);
			}
		});
	}

	static setCanvas(canvas) {
		return new Promise((resolve) => {
			if (canvas instanceof HTMLElement) {
				canvas.style.position = 'fixed';
				canvas.style.zIndex = 200;
				canvas.style.transform = '';
				canvas.classList.add('js-ajax-transition-clone');

				document.body.appendChild(canvas);

				AJAXHelpers.resolveOnNextTick(resolve);
			} else {
				AJAXHelpers.resolveOnNextTick(resolve);
			}
		});
	}

	static cloneMedia({ currentElement, nextElement, target = document.body, position = 'fixed' } = { target: document.body, position: 'fixed' }) {
		return new Promise((resolve) => {
			if (!currentElement || !nextElement) {
				resolve({
					cloneElement: null,
					nextElement
				});
				return;
			}

			const {
				top,
				left,
				width,
				height
			} = currentElement.getBoundingClientRect(),
				tl = gsap.timeline(),
				cloneElement = currentElement.cloneNode(true),
				mediaElement = currentElement.querySelector('.js-ajax-transition-element__media'),
				objectFit = gsap.getProperty(mediaElement, 'objectFit'),
				objectPosition = gsap.getProperty(mediaElement, 'objectPosition'),
				mediaWidth = mediaElement.offsetWidth,
				mediaHeight = mediaElement.offsetHeight,
				videoEl = currentElement.querySelector('video'),
				nextOverlayEl = nextElement.querySelector('.js-ajax-transition-element__overlay');

			[cloneElement, mediaElement].forEach((el) => {
				if (el) {
					// el.removeAttribute('class');
					el.classList.remove(
						'w-100',
						'h-100',
						'full-width',
						'full-height',
						'auto-width-height',
						'w-auto',
						'h-auto'
					);
				}
			});

			cloneElement.classList.add('js-ajax-transition-clone');
			mediaElement.classList.add('js-ajax-transition-element__media');

			const hiddenTransitionElements = [...cloneElement.querySelectorAll('.js-ajax-transition-hidden-element')];

			if (hiddenTransitionElements.length) {
				gsap.set(hiddenTransitionElements, {
					autoAlpha: 0,
					overwrite: true
				});
			}

			// if (nextOverlayEl) {
			// 	const cloneOverlay = nextOverlayEl.cloneNode(true);

			// 	tl.set(cloneOverlay, {
			// 		autoAlpha: 0
			// 	});

			// 	cloneElement.appendChild(cloneOverlay);
			// }

			tl.set(cloneElement, {
				margin: 0,
				padding: 0,
				zIndex: 400,
				maxWidth: 'unset',
				maxHeight: 'unset',
				position,
				transform: 'none',
				overflow: 'hidden',
				top,
				left,
				width,
				height,
				opacity: 0,
			});

			tl.set(mediaElement, {
				objectFit,
				objectPosition,
				width: mediaWidth,
				height: mediaHeight
			});

			if (videoEl) {
				const
					cloneVideoEl = cloneElement.querySelector('video'),
					nextVideoEl = nextElement.querySelector('video');

				cloneVideoEl.currentTime = videoEl.currentTime;

				if (nextVideoEl) {
					nextVideoEl.currentTime = cloneVideoEl.currentTime;
				}

				target.appendChild(cloneElement);

				tl.to(cloneElement, {
					duration: 0.2,
					opacity: 1,
					onComplete: () => {
						Promise.all([
							cloneVideoEl.play(),
							nextVideoEl.play()
						])
							.then(() => AJAXHelpers.resolveOnNextTick(resolve, { cloneElement, nextElement }))
							.catch(() => AJAXHelpers.resolveOnNextTick(resolve, { cloneElement, nextElement }));
					}
				});
			} else {
				target.appendChild(cloneElement);

				tl.to(cloneElement, {
					duration: 0.25,
					opacity: 1,
					onComplete: () => {
						AJAXHelpers.resolveOnNextTick(resolve, { cloneElement, nextElement });
					}
				});
			}
		});
	}
}
