class BaseAnimation {
	constructor() {
		this.animations = {
			'animatedScale': {
				animationName: 'animateScale',
				initialVars: {
					scale: 0
				},
				targetVars: {
					animateFrom: 'center',
					ease: 'power3.out',
					duration: 0.6
				}
			},
			'animatedBorderHorizontal': {
				animationName: 'animateScale',
				initialVars: {
					scaleX: 0
				},
				targetVars: {
					animateFrom: 'left',
					ease: 'power4.out',
					duration: 1.2
				}
			},
			'animatedMask': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'center',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'center',
					shape: 'rectangle',
					ease: 'power4.out',
					duration: 1.2,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskCircle': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'center',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'center',
					shape: 'circle',
					ease: 'power2.inOut',
					duration: 1.2,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskEllipse': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'center',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'center',
					shape: 'ellipse',
					ease: 'power2.inOut',
					duration: 1.2,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskFromTop': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'bottom',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'top',
					shape: 'rectangle',
					ease: 'power3.inOut',
					duration: 0.9,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskFromBottom': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'top',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'bottom',
					shape: 'rectangle',
					ease: 'power3.inOut',
					duration: 0.9,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskFromLeft': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'right',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'left',
					shape: 'rectangle',
					ease: 'power3.inOut',
					duration: 0.9,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedMaskFromRight': {
				animationName: 'animateMask',
				setAnimationName: 'hideMask',
				initialVars: {
					animateTo: 'left',
					duration: 0,
					overwrite: false,
					clearProps: false,
					scaleInner: '.js-animated-mask-inner',
				},
				targetVars: {
					animateFrom: 'right',
					shape: 'rectangle',
					ease: 'power3.inOut',
					duration: 0.9,
					scale: 1.2,
					// overwrite: true,
					scaleInner: '.js-animated-mask-inner',
				}
			},
			'animatedReveal': {
				initialVars: {
					yPercent: -100
				},
				targetVars: {
					yPercent: 0,
					ease: 'power3.out',
					duration: 1.2
				}
			},
			'animatedRevealBottom': {
				initialVars: {
					yPercent: 100
				},
				targetVars: {
					yPercent: 0,
					ease: 'power3.out',
					duration: 1.2
				}
			},
			'animatedJump': {
				initialVars: {
					autoAlpha: 0,
					yPercent: 30
				},
				targetVars: {
					autoAlpha: 1,
					yPercent: 0,
					ease: 'power3.out',
					duration: 0.6
				}
			},
			'animatedJumpFromLeft': {
				initialVars: {
					autoAlpha: 0,
					xPercent: -30
				},
				targetVars: {
					autoAlpha: 1,
					xPercent: 0,
					ease: 'power3.out',
					duration: 0.6
				}
			},
			'animatedJumpFromRight': {
				initialVars: {
					autoAlpha: 0,
					xPercent: 30
				},
				targetVars: {
					autoAlpha: 1,
					xPercent: 0,
					ease: 'power3.out',
					duration: 0.6
				}
			},
			'animatedJumpScale': {
				initialVars: {
					autoAlpha: 0,
					scaleX: 1,
					scaleY: 1.5,
					x: 0,
					y: 300,
					xPercent: 0,
					yPercent: 0
				},
				targetVars: {
					autoAlpha: 1,
					scaleX: 1,
					scaleY: 1,
					x: 0,
					y: 0,
					xPercent: 0,
					yPercent: 0,
					ease: 'power3.out',
					duration: 0.6
				}
			},
			'animatedFade': {
				initialVars: {
					autoAlpha: 0
				},
				targetVars: {
					autoAlpha: 1,
					ease: 'power3.out',
					duration: 0.6
				}
			}
		};
	}

	prepareAnimation() {
		return new Promise((resolve) => {
			ScrollTrigger.refresh();
			resolve(true);
		});
	}

	getScrubAnimation() {

	}

	getRevealAnimation() {

	}

	_registerAnimations() {
		const timeScale = app.utilities.getTimeScaleByKey('onScrollReveal');

		for (const [name, options] of Object.entries(this.animations)) {
			const elements = this._getScopedAnimationElements(`[data-arts-os-animation-name="${name}"]`);

			if (elements.length) {
				const vars = {
					elements
				};

				if ('initialVars' in options) {
					Object.assign(vars, {
						initialVars: options['initialVars']
					});
				}

				if ('setAnimationName' in options && typeof gsap.effects[options.setAnimationName] === 'function') {
					Object.assign(vars, {
						shouldRunSetTween: false,
						setCb: (localElements, localVars) => {
							gsap.effects[options.setAnimationName](localElements, localVars);
						}
					});
				}

				if ('animationName' in options && typeof gsap.effects[options.animationName] === 'function') {
					Object.assign(vars, {
						shouldRunTween: false,
						cb: (batch) => {
							if ('duration' in options['targetVars']) {
								const originalDuration = options['targetVars']['duration'];

								Object.assign(options['targetVars'], {
									duration: originalDuration / timeScale
								});
							}

							gsap.effects[options.animationName](batch, options['targetVars']);
						}
					});
				}

				this._createBatchSTReveal(vars);
			}
		}
	}

	_getRevealTextAnimation() {
		const elements = this._getScopedAnimationElements();

		this._createBatchSTReveal({
			elements,
			shouldRunTween: false,
			clearVars: false,
			cb: (batch) => {
				this._animateText(batch);
			}
		});
	}

	_animateText(batch) {
		const tl = gsap.timeline();

		batch.forEach((el, index) => {
			if (el instanceof HTMLElement) {
				const type = el.getAttribute('data-arts-split-text-preset');

				switch (type) {
					case 'animatedCounterChars':
						tl.animateChars(el, {
							duration: 1.2,
							y: '-40%',
							stagger: {
								from: 'start',
								amount: .1
							}
						}, 'start');
						break;
					case 'animatedChars':
						tl.animateChars(el, {
							duration: 1.2,
							stagger: {
								from: 'start',
								amount: .3
							}
						}, 'start');
						break;
					case 'animatedCharsRandom':
						tl.animateChars(el, {
							duration: 1.2,
							stagger: {
								from: 'random',
								amount: .3
							}
						}, 'start');
						break;
					case 'animatedWords':
						tl.animateWords(el, {
							duration: 1.2,
							stagger: {
								from: 'start',
								amount: .1
							}
						}, index === 0 ? 'start' : '<20%');
						break;
					case 'animatedLines':
						tl.animateLines(el, {
							duration: 1.2,
							stagger: 0.07
						}, index === 0 ? 'start' : '<20%');
						break;
				}

			}
		});

		this._animateOutlines(tl);

		tl.timeScale(app.utilities.getTimeScaleByKey('onScrollReveal'));
	}

	_animateOutlines(timeline) {
		if (timeline && this.elements.outlines && this.elements.outlines.length) {
			timeline.add(() => {
				this.elements.outlines.forEach((el, index) => {
					timeline.to(el, {
						duration: 1.8,
						drawSVG: '100% 0%',
						ease: 'expo.inOut',
						delay: index * 0.1,
						onStart: () => {
							const parentOverflowLine = this.elements.outlines[index].closest('.js-arts-split-text__wrapper-line');

							if (parentOverflowLine) {
								parentOverflowLine.classList.remove('overflow-hidden');
								parentOverflowLine.style.overflow = 'initial';
							}

							this.elements.outlines[index].classList.add('color-accent');
						}
					}, '<');
				});
			}, '<50%');
		}
	}

	_initAnimations() {
		if (this._hasAnimationScene()) {
			this.prepareAnimation().then(() => {
				this._getRevealTextAnimation();
				this._registerAnimations();
				this._setAnimationReady();
				this._createSTReveal();
			});
		}

		this._createSTScrub();
	}

	_createSTReveal() {
		const animation = this.getRevealAnimation();

		if (animation) {
			const
				masterTimeline = gsap.timeline({
					defaults: {
						duration: 1.2,
						ease: 'power3.out'
					},
					onStart: () => {
						app.utilities.dispatchEvent('animation/start', {}, this.element);
					},
					onUpdate: () => {
						app.utilities.dispatchEvent('animation/update', {}, this.element);
					},
					onComplete: () => {
						animation.kill();
						app.utilities.dispatchEvent('animation/end', {}, this.element);
					}
				}).add(animation.play()),
				preloaderRef = app.componentsManager.getComponentByName('Preloader'),
				triggerHook = app.utilities.getTriggerHookValue();

			masterTimeline.timeScale(app.utilities.getTimeScaleByKey('onScrollReveal'));

			this.stReveal = ScrollTrigger.create({
				start: this.containerAnimation ? `top bottom` : `top bottom-=${window.innerHeight * triggerHook}px`,
				animation: masterTimeline,
				trigger: this.element,
				invalidateOnRefresh: true,
				// containerAnimation: this.containerAnimation,
				once: true
			});

			if (preloaderRef) {
				this.stReveal.disable();

				preloaderRef.loaded.then(() => {
					this.stReveal.enable();
				});
			} else {
				if (this._isWebGLEnabled()) {
					this.stReveal.disable();

					this.webGLReady.then(() => {
						this.stReveal.enable();
					});
				}
			}
		}
	}

	_createSTScrub() {
		const config = this.getScrubAnimation();

		if (config) {
			if (this.containerAnimation) {
				config['containerAnimation'] = this.containerAnimation;
			}

			if (config.matchMedia) {
				this.mmSTScrub = gsap.matchMedia();
				this.mmSTScrub.add(config.matchMedia, () => {
					this.stScrub = ScrollTrigger.create(config);
				});
			} else {
				this.stScrub = ScrollTrigger.create(config);
			}

			document.addEventListener('arts/barba/transition/start', () => {
				if (this.stScrub) {
					this.stScrub.kill();
				}

				if (this.mmSTScrub && typeof this.mmSTScrub.kill === 'function') {
					this.mmSTScrub.kill();
				}
			}, {
				once: true
			});
		}
	}

	_createBatchSTReveal({
		initialVars = {},
		targetVars = {},
		clearVars = {},
		elements,
		interval = 0.05,
		batchMax = 6,
		setCb,
		cb,
		shouldRunTween = true,
		shouldRunSetTween = true,
	} = {

		}) {

		if (elements) {
			const
				timeScale = app.utilities.getTimeScaleByKey('onScrollReveal'),
				triggerHook = app.utilities.getTriggerHookValue(),
				batchVars = {
					interval,
					batchMax,
					start: ({ trigger }) => {
						const offset = trigger.getBoundingClientRect().top < window.innerHeight ? 0 : window.innerHeight * triggerHook;

						return `top bottom-=${offset}px`;
					},
					once: true
				},
				defaultTargetVars = {
					autoAlpha: 1,
					x: 0,
					y: 0,
					xPercent: 0,
					yPercent: 0,
					scaleX: 1,
					scaleY: 1,
					duration: 0.6,
					stagger: 0.07,
					ease: 'power3.out',
				},
				defaultClearVars = {
					clearProps: 'opacity,visibility,transform'
				},
				preloaderRef = app.componentsManager.getComponentByName('Preloader');

			if (typeof targetVars === 'object') {
				targetVars = deepmerge(defaultTargetVars, targetVars);
			}

			if (typeof clearVars === 'object') {
				clearVars = deepmerge(defaultClearVars, clearVars);
			}

			if ('duration' in targetVars) {
				const originalDuration = targetVars['duration'];

				Object.assign(targetVars, {
					duration: originalDuration / timeScale
				});
			}

			Object.assign(batchVars, {
				onEnter: (batch) => {
					Object.assign(targetVars, {
						onStart: () => {
							app.utilities.dispatchEvent('animation/start', {}, this.element);
						},
						onUpdate: () => {
							app.utilities.dispatchEvent('animation/update', {}, this.element);
						},
						onComplete: () => {
							if (typeof clearVars === 'object') {
								gsap.set(batch, clearVars);
							}
							app.utilities.dispatchEvent('animation/complete', {}, this.element);
						}
					});

					if (typeof cb === 'function') {
						cb(batch, targetVars);
					}

					if (!!shouldRunTween) {
						gsap.to(batch, targetVars);
					}
				}
			});

			Object.assign(initialVars, {
				onComplete: () => {
					const batchST = ScrollTrigger.batch(elements, batchVars);

					if (preloaderRef) {
						batchST.forEach(instance => instance.disable());

						preloaderRef.loaded.then(() => {
							batchST.forEach(instance => instance.enable());
						});
					} else {
						if (this._isWebGLEnabled()) {
							batchST.forEach(instance => instance.disable());

							this.webGLReady.then(() => {
								batchST.forEach(instance => instance.enable());
							});
						}
					}
				}
			});

			if (typeof setCb === 'function') {
				setCb(elements, initialVars);
			}

			if (!!shouldRunSetTween) {
				gsap.set(elements, initialVars);
			}

			// Reset position
			ScrollTrigger.addEventListener('refreshInit', () => gsap.set(elements, {
				x: 0,
				y: 0,
				xPercent: 0,
				yPercent: 0
			}));
		}
	}

	_setAnimationReady() {
		this.element.setAttribute('data-arts-os-animation', 'ready');
	}

	_hasAnimationScene() {
		const animationAttribute = this.element.getAttribute('data-arts-os-animation');

		return !!animationAttribute && animationAttribute !== 'false';
	}

	_getScopedSelector(selector) {
		return `:scope ${selector}:not(:scope [data-arts-component-name] ${selector}):not(:scope [data-arts-component-name]${selector})`;
	}

	_getScopedAnimationElements(selector = '[data-arts-split-text-preset]') {
		const containers = [...this.element.querySelectorAll(this._getScopedSelector(selector))];

		if (this.element.matches(selector)) {
			containers.push(this.element);
		}

		return containers;
	}
}
