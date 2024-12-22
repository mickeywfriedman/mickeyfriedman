class BaseComponent extends BaseAnimation {
	constructor({
		name,
		element,
		loadInnerComponents,
		parent,
		defaults,
		innerElements
	}) {
		super();

		this.mounted = false;
		this.containerAnimation = undefined;
		this.ready = new Promise((resolve) => {
			this._setReady = resolve;
		});
		this.webGLReady = new Promise((resolve) => {
			this._setWebGLReady = resolve;
		});

		this.loadInnerComponents = loadInnerComponents;
		this.name = name;
		this.element = element;
		this.parent = parent;
		this.defaults = defaults;
		this.innerSelectors = innerElements;
		this.components = [];
		this.elements = {};
		this.options = {};
		this.lazy = null;

		// Component options
		this._updateOptions();

		// Component inner elements
		this._updateElements({
			container: this.element,
			elements: this.innerSelectors
		});
	}

	setup() {
		const AJAX = app.componentsManager.getComponentByName('AJAX');

		document.fonts.ready.then(() => this.mount()).then(() => {
			if (AJAX && AJAX.running) {
				this.init();

				document.addEventListener('arts/barba/transition/end/before', this._initAnimations.bind(this), {
					once: true
				});
			} else {
				this.init();
				this._initAnimations();
			}

			// Set component ready on the next tick
			gsap.ticker.add(this._setReady.bind(this), true, false);
		});
	}

	init() {

	}

	destroy() {

	}

	update() {
		this._updateOptions();
	}

	reload(options) {
		if (this.stReveal) {
			this.stReveal.kill();
		}

		if (this.stScrub) {
			this.stScrub.kill();
		}

		this.destroy();
		this._updateOptions({
			attributeSelector: options ? false : undefined,
			options
		});
		this.init();
		this._initAnimations();
	}

	mount() {
		return new Promise((resolve) => {
			// console.log(`Mounting component: ${this.name}...`);

			if (this.parent && this.parent.horizontalScroll) {
				this.horizontalScroll = this.parent.horizontalScroll;
				this.containerAnimation = this.horizontalScroll.getContainerAnimation(this.element);
			}

			if (this.mounted || !this.loadInnerComponents) {
				this.mounted = true;

				resolve(true);
			} else {

				Promise.all(app.componentsManager.init({
					storage: this.components,
					scope: this.element,
					parent: this,
					nameAttribute: 'data-arts-component-name',
					optionsAttribute: 'data-arts-component-options',
				}))
					.then(() => {
						this._initSplitText();
						this._initLazyMedia();
						this.mounted = true;

						resolve(true);
					});
			}
		});
	}

	destroySplitText() {
		this.splitObserver.disconnect();
		this.splitTextInstance.forEach(instance => {
			instance.destroy();
		});
	}

	updateRef(key, componentName) {
		if (!key || !componentName) {
			return;
		}

		if (!this[key]) {
			this[key] = app.componentsManager.getComponentByName(componentName);
		}

		return this[key];
	}

	setLoading(loading = true) {
		if (!!app.options.cursorLoading) {
			this.element.classList.toggle('cursor-progress', loading);
		}
	}

	_initLazyMedia() {
		const lazyMedia = [...this.element.querySelectorAll('.lazy:not(:scope [data-arts-component-name] .lazy)')];

		if (lazyMedia.length) {
			lazyMedia.forEach((element) => {
				const
					parent = element.parentElement,
					width = element.getAttribute('width'),
					height = element.getAttribute('height'),
					isBackground = window.getComputedStyle(element).position === 'absolute',
					isFullheight = element.classList.contains('full-height') || element.classList.contains('hs-full-height');

				if (!isBackground && !isFullheight && parent && width && height && !element.closest('.custom-aspect-ratio') && !element.closest('.auto-width-height')) {
					parent.style.setProperty('--media-width', width);
					parent.style.setProperty('--media-height', height);
					parent.classList.add('has-aspect-ratio');


					// if (CSS.supports('aspect-ratio", "1 / 1')) {
					// 	element.parentElement.style.aspectRatio = `${width} / ${height}`;
					// } else {
					// }
				}
			});

			ScrollTrigger.create({
				trigger: this.element,
				start: () => `top-=1000px bottom`,
				scrub: false,
				containerAnimation: this.containerAnimation,
				once: true,
				onEnter: () => {
					lazyMedia.forEach((el) => {
						LazyLoad.load(el);
					});
				}
			});
		}
	}

	_initSplitText() {
		const splitTarget = this._getScopedAnimationElements();
		let options = {
			init: true,
			type: 'lines',
			set: {
				type: 'lines',
				direction: 'y',
				distance: '100%',
				opacity: false
			},
			wrap: 'lines',
			wrapClass: 'overflow-hidden',
		};

		this.splitTextInstance = [];
		this.splitTextTriggered = false;
		this.splitObserver = new ResizeObserver(app.utilities.debounce(this._onSplitTextResize.bind(this), 50));

		splitTarget.forEach((el, index) => {
			const presetAttribute = el.getAttribute('data-arts-split-text-preset');
			this._createTextOutlines(el);

			if (presetAttribute && presetAttribute in app.animations.splitTextPresets) {
				options = app.animations.splitTextPresets[presetAttribute];
			}

			try {
				this.splitTextInstance[index] = new ArtsSplitText(el, options);

				this.splitObserver.observe(el);
			} catch (error) {
				console.error(`An error occured in component ${this.name}: ${error}`);
			}
		});
	}

	_createTextOutlines(el) {
		const outlines = [...el.querySelectorAll('u')];

		if (outlines.length && typeof app.options.circleTemplate === 'string') {
			this.elements.outlines = [];

			outlines.forEach((el) => {
				el.insertAdjacentHTML('beforeend', app.options.circleTemplate);

				const outline = el.querySelector('ellipse');

				this.elements.outlines.push(outline);

				if (this._hasAnimationScene()) {
					gsap.set(outline, {
						drawSVG: '0% 0%'
					});
				}
			});
		}
	}

	_onSplitTextResize(entries) {
		if (!this.splitTextTriggered) {
			this.splitTextTriggered = true;
			return;
		}

		for (const entry of entries) {
			this.elements.outlines = [];
			this.splitTextInstance.forEach((instance) => {
				if (instance.containerElement === entry.target) {
					instance.destroy();

					if (entry.target.classList.contains('split-text-animation-revealed')) {
						[...entry.target.querySelectorAll('u ellipse')].forEach((el) => {
							el.style = null;
						});
					}

					const outlines = [...entry.target.querySelectorAll('u')];

					outlines.forEach((el) => {
						const underline = el.querySelector('ellipse');
						this.elements.outlines.push(underline);
					});

					instance.init();

					if (entry.target.classList.contains('split-text-animation-revealed')) {
						[...entry.target.querySelectorAll('u ellipse')].forEach((el) => {
							const parentOverflowLine = el.closest('.js-arts-split-text__wrapper-line');

							if (parentOverflowLine) {
								parentOverflowLine.classList.remove('overflow-hidden');
								parentOverflowLine.style.overflow = 'initial';
							}
						});
					}
				}
			});
		}
	}

	_setReady() {

	}

	_setWebGLReady() {

	}

	_isWebGLEnabled() {
		return !!this.options.webGL && !!this.options.webGL.enabled;
	}

	_updateOptions({
		container = this.element,
		target = this.options,
		defaults = this.defaults,
		attributeSelector = 'data-arts-component-options',
		options = {}
	} = {}) {
		if (!container) {
			return {};
		}

		let resultOptions = {};

		if (options && defaults) {
			resultOptions = deepmerge(defaults, options);
		}

		if (attributeSelector) {
			// attempt to find & parse inline options via attribute selector
			const inlineOptions = app.utilities.parseOptionsStringObject(container.getAttribute(attributeSelector));

			// override with inline options
			if (inlineOptions && Object.keys(inlineOptions).length !== 0) {
				resultOptions = deepmerge(resultOptions, inlineOptions);
			}
		}

		Object.assign(target, resultOptions);
	}

	_updateElements({
		container,
		elements
	}) {

		if (container && elements && typeof elements === 'object') {
			for (const key in elements) {
				const selector = `${elements[key]}`;
				// const selector = `${elements[key]}:not(:scope [data-arts-component-name] ${elements[key]})`;

				Object.assign(this.elements, {
					[key]: [...container.querySelectorAll(selector)]
				});
			}
		}
	}

	_getInnerComponentByName(name) {
		const index = this.components.findIndex(p => p.name === name);

		if (index > -1) {
			return this.components[index];
		} else {
			return false;
		}
	}
}
window.BaseComponent = BaseComponent;
