class AJAXAnimations {
	static animateCurtains(data, {
		duration = 2.4,
		ease = 'expo.inOut',
		motionOffsetX = '0vh',
		motionOffsetY = '10vh'
	} = {}) {
		return new Promise((resolve) => {
			const
				headerRef = app.componentsManager.getComponentByName('Header'),
				shouldInverseDirection = AJAXAnimations._shouldInverseDirection(data, headerRef);

			// Header overlay menu is opened
			if (headerRef && headerRef.instance.opened) {
				AJAXAnimations.animateContainersWithOpenedOverlayMenu(data, {
					duration,
					ease,
					motionOffsetX,
					motionOffsetY,
					shouldInverseDirection,
					headerRef
				}).then(() => AJAXHelpers.resolveOnNextTick(resolve));
			} else {
				AJAXAnimations.animateContainers(data, {
					duration,
					ease,
					motionOffsetX,
					motionOffsetY,
					shouldInverseDirection
				}).then(() => AJAXHelpers.resolveOnNextTick(resolve));
			}
		});
	}

	static animateContainersWithOpenedOverlayMenu(data, {
		duration = 2.4,
		ease = 'expo.inOut',
		motionOffsetX = '0vh',
		motionOffsetY = '10vh',
		shouldInverseDirection = false,
		headerRef
	} = {}) {
		return new Promise((resolve) => {
			app.utilities.scrollLock(false);

			AJAXHelpers.resetScrollPosition(0.2).then(() => {
				headerRef.instance.toggleOverlay(false);

				const
					headerTL = headerRef.instance.overlay.timeline,
					headerTLDuration = headerTL.duration(), // save original duration
					tl = gsap.timeline({
						defaults: {
							duration,
							ease
						},
						onComplete: () => {
							headerTL.duration(headerTLDuration);
							AJAXHelpers.resolveOnNextTick(resolve);
						}
					});

				tl
					.set(data.current.container, {
						opacity: 0
					})
					.set(data.next.content, {
						opacity: 1
					})
					.set(data.next.container, {
						opacity: 1,
						zIndex: 100,
						x: shouldInverseDirection ? `-${motionOffsetX}` : `${motionOffsetX}`,
						y: shouldInverseDirection ? `-${motionOffsetY}` : `${motionOffsetY}`
					})
					.to(data.next.container, {
						y: '0vh',
						x: '0vw'
					})
					.add(headerTL.duration(duration), '<');
				// .set(data.current.container, {
				// 	clearProps: 'transform,opacity,visibility'
				// });
			});
		});
	}

	static animateContainers(data, {
		duration = 2.4,
		ease = 'expo.inOut',
		motionOffsetX = '0vh',
		motionOffsetY = '10vh',
		shouldInverseDirection = false
	} = {}) {
		return new Promise((resolve) => {
			const
				backgroundColor = gsap.getProperty(data.next.container, 'backgroundColor'),
				tl = gsap.timeline({
					defaults: {
						duration,
						ease
					},
					onComplete: () => {
						AJAXHelpers.resolveOnNextTick(resolve);
					}
				});

			tl
				.set(document.body, {
					backgroundColor
				});

			[...data.current.container.querySelectorAll('.pin-spacer > *')].forEach((el) => {
				const isFixedPosition = gsap.getProperty(el, 'position') === 'fixed';

				if (isFixedPosition) {
					tl.set(el, {
						translateY: window.scrollY
					});
				}
			});

			tl
				.set(data.next.content, {
					opacity: 1
				})
				.set(data.next.container, {
					opacity: 1,
					zIndex: 100,
					x: shouldInverseDirection ? `-${motionOffsetX}` : `${motionOffsetX}`,
					y: shouldInverseDirection ? `-${motionOffsetY}` : `${motionOffsetY}`
				});

			tl.to(data.current.container, {
				x: shouldInverseDirection ? `${motionOffsetX}` : `-${motionOffsetX}`,
				y: shouldInverseDirection ? `${motionOffsetY}` : `-${motionOffsetY}`,
			}, '<')
				.to(data.current.content, {
					opacity: 0
				}, '<');

			tl
				.animateCurtain(data.next.container, {
					duration,
					animateFrom: shouldInverseDirection ? 'top' : 'bottom',
					clearProps: '',
					ease
				}, '<')
				.to(data.next.container, {
					y: '0vh',
					x: '0vw'
				}, '<');
		});
	}

	static hideContent(data, {
		duration = 0.2
	} = {}) {
		return new Promise((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => AJAXHelpers.resolveOnNextTick(resolve)
			});

			if (data.current.content) {
				tl.to(data.current.content, {
					duration,
					autoAlpha: 0
				}, '<');
			}

			if (data.next.content) {
				tl.set(data.next.content, {
					opacity: 0
				}, '<');
			}
		});
	}

	static animateMedia({
		cloneElement,
		nextElement,
		duration = 2.4,
		ease = 'expo.inOut'
	} = {}) {
		return new Promise((resolve) => {
			const
				tl = gsap.timeline({
					defaults: {
						duration,
						ease
					},
					onComplete: () => AJAXHelpers.resolveOnNextTick(resolve)
				}),
				currentMedia = cloneElement.querySelector('.js-ajax-transition-element__media'),
				currentMask = cloneElement.querySelector('.js-ajax-transition-element__mask'),
				currentOverlay = cloneElement.querySelector('.js-ajax-transition-element__overlay'),
				nextMedia = nextElement.querySelector('.js-ajax-transition-element__media'),
				nextOverlay = nextElement.querySelector('.js-ajax-transition-element__overlay'),
				getterElement = gsap.getProperty(nextElement),
				getterMedia = gsap.getProperty(nextMedia),
				isDifferentMediaSrc = nextMedia.src !== currentMedia.src,
				{ top, left, width, height } = nextElement.getBoundingClientRect(),
				x = getterMedia('x', '%'),
				y = getterMedia('y', '%'),
				offsetWidth = nextMedia.offsetWidth,
				offsetHeight = nextMedia.offsetHeight,
				scale = getterMedia('scale'),
				transformOrigin = getterMedia('transform-origin', '%'),
				objectFit = getterMedia('objectFit'),
				objectPosition = getterMedia('objectPosition');

			let clonedMedia;

			tl
				.set(nextElement, {
					autoAlpha: 0
				})
				.to(cloneElement, {
					top,
					left,
					width,
					height,
					overflow: () => getterElement('overflow'),
					borderRadius: () => getterElement('borderRadius'),
					'--shape-size': 100,
					// clipPath: () => getterElement('clipPath')
				}, 'start');

			if (currentOverlay && nextOverlay) {
				const opacity = gsap.getProperty(nextOverlay, 'opacity');

				tl.to(currentOverlay, {
					autoAlpha: opacity
				}, 'start');
			}

			if (currentOverlay && !nextOverlay) {
				tl.to(currentOverlay, {
					autoAlpha: 0
				}, 'start');
			}

			if (currentMask) {
				tl.to(currentMask, {
					transform: 'none',
					width: '100%',
					height: '100%',
					transformOrigin: 'center center'
				}, 'start');
			}

			if (isDifferentMediaSrc) {
				clonedMedia = currentMedia.cloneNode(true);

				clonedMedia.src = nextMedia.src;

				gsap.set(clonedMedia, {
					autoAlpha: 0,
					position: 'absolute',
					top: 0,
					left: 0,
					scale: 1.1,
					transformOrigin: 'center center',
					zIndex: 50
				});

				cloneElement.appendChild(clonedMedia);

				tl
					.to(currentMedia, {
						autoAlpha: 0,
						scale: 1.1,
						transformOrigin: 'center center'
					}, 'start')
					.to(clonedMedia, {
						autoAlpha: 1,
						x: 0,
						y: 0,
						xPercent: x,
						yPercent: y,
						scale,
						transformOrigin,
						objectFit,
						objectPosition,
						width: offsetWidth,
						height: offsetHeight
					}, 'start');
			} else {
				tl
					.to(currentMedia, {
						x: 0,
						y: 0,
						xPercent: x,
						yPercent: y,
						scale,
						transformOrigin,
						objectFit,
						objectPosition,
						width: offsetWidth,
						height: offsetHeight
					}, 'start');
			}

			tl.set(nextElement, {
				clearProps: 'opacity,visibility'
			})
		});
	}

	static killAll(data) {
		ScrollTrigger.getAll()
			.filter((instance) => instance.trigger && data.current.container && data.current.container.contains(instance.trigger))
			.forEach((instance) => {
				instance.kill(false, false);
				instance = null;
			});

		// ScrollTrigger.clearMatchMedia();
	}

	static updateAll(data) {
		ScrollTrigger.getAll()
			.filter((instance) => instance.trigger && data.current.container && data.current.container.contains(instance.trigger))
			.forEach((instance) => {
				instance.refresh(false);
			});
	}

	static _shouldInverseDirection(data, headerRef) {
		return data.trigger && data.trigger === 'back' && (!headerRef || (headerRef && !headerRef.instance.opened));
	}
}
