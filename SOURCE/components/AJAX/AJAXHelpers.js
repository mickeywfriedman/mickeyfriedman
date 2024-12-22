class AJAXHelpers {
	static getTransitionDuration() {
		let result = 1.2; // default

		if (typeof app.options.ajax.transitionDuration === 'number') {
			return app.options.ajax.transitionDuration;
		}

		return result;
	}

	static getTransitionEase() {
		let result = 'expo.inOut'; // default

		if (typeof app.options.ajax.transitionEase === 'string') {
			return app.options.ajax.transitionEase;
		}

		return result;
	}

	static removeClonedElements() {
		return new Promise((resolve) => {
			const clones = [...document.querySelectorAll('.js-ajax-transition-clone')];

			if (clones.length) {
				const tl = gsap.timeline({
					onComplete: () => AJAXHelpers.resolveOnNextTick(resolve)
				});

				clones.forEach(clone => {
					// clone.remove();
					tl.to(clone, {
						autoAlpha: 1,
						duration: 0.2,
						// mixBlendMode: 'difference',
						onComplete: () => {
							clone.remove();
							// gsap.ticker.add(clone.remove.bind(clone), true, false);
						}
					}, 'start');
				});
			} else {
				AJAXHelpers.resolveOnNextTick(resolve);
			}
		})
	}

	static cleanContainers(data) {
		return new Promise((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => AJAXHelpers.resolveOnNextTick(resolve)
			});

			if (data.next.container) {
				tl.set(data.next.container, {
					clearProps: 'all'
				});
			}
		});
	}

	static cleanContent() {
		return new Promise((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => AJAXHelpers.resolveOnNextTick(resolve)
			});

			if (app.contentEl) {
				tl.set(app.contentEl, {
					clearProps: 'all'
				});
			}
		});
	}

	static cleanBody() {
		return new Promise((resolve) => {
			gsap.set(document.body, {
				clearProps: 'backgroundColor,overflow',
				onComplete: AJAXHelpers.resolveOnNextTick(resolve)
			});
		});
	}

	static resolveOnNextTick(resolve, args = true) {
		gsap.ticker.add(() => resolve(args), true, false);
	}

	static resetScrollPosition(duration = 0) {
		return new Promise((resolve) => {
			app.utilities.scrollTo({
				target: 0,
				duration,
				cb: () => {
					ScrollTrigger.clearScrollMemory('manual');
					ScrollTrigger.refresh(false);
					AJAXHelpers.resolveOnNextTick(resolve);
				}
			});
		});
	}

	static dispatchEvent(name, options, target = document) {
		if (target) {
			const event = new CustomEvent(name, options);

			target.dispatchEvent(event);
		}
	}

	static sanitizeSelector(string) {
		if (!string || !string.length) {
			return false;
		}

		return string
			.replace(/(\r\n|\n|\r)/gm, '') // remove tabs, spaces
			.replace(/(\\n)/g, '') // remove lines breaks
			.replace(/^[,\s]+|[,\s]+$/g, '') // remove redundant commas
			.replace(/\s*,\s*/g, ','); // remove duplicated commas
	}
}
