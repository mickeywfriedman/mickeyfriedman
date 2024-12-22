export default class AJAX extends BaseComponent {
	constructor({
		name,
		loadInnerComponents,
		parent,
		element,
		options
	}) {
		super({
			name,
			loadInnerComponents,
			parent,
			element,
			// External options from app.options.ajax
			defaults: options,
			// Component inner elements
			innerElements: {
				block: '#page-blocking-curtain',
				indicator: '#loading-indicator'
			}
		});
		this._handlers = {
			onTransitionStart: this._transitionStart.bind(this),
			onTransitionEnd: this._transitionEnd.bind(this),
			onTransitionInit: app.initAJAX.bind(app)
		};

		this.instance = null;
		this.running = false;
		this.webpSupported = false;
		this.runningSeamlessTransition = false;

		this.setup();
	}

	init() {
		this._testWebP().then(() => {
			this._createBarbaInstance();
			this._attachEvents();
			this._setScrollRestoration();
		});
	}

	_createBarbaInstance() {
		this.instance = barba.init({
			timeout: this.options.timeout,
			prevent: this._prevent.bind(this),
			// custom transitions
			transitions: [
				AJAXTransitionFlyingImage,
				AJAXTransitionAutoScrollNext,
				AJAXTransitionGeneral
			],
			customHeaders: this._customHeaders.bind(this)
		});
	}

	_attachEvents() {
		document.addEventListener('arts/barba/transition/start', this._handlers.onTransitionStart);
		document.addEventListener('arts/barba/transition/end', this._handlers.onTransitionEnd);
		document.addEventListener('arts/barba/transition/init/after', this._handlers.onTransitionInit);
	}

	_prevent({ el }) {
		let
			url = el.getAttribute('href'),
			customRules = !!this.options.preventRules && this.options.preventRules.length ? AJAXHelpers.sanitizeSelector(this.options.preventRules) : null,
			exludeRules = [
				'.has-click-and-hold',
				'.has-click-and-hold a',
				'.no-ajax',
				'.no-ajax a',
				'[data-elementor-open-lightbox]', // Elementor lightbox gallery
				'[data-elementor-lightbox-slideshow]', // Elementor Pro Gallery
				'.lang-switcher a', // language switcher area
				'.widget_polylang a',
				'.trp-language-switcher a',
				'.wpml-ls-item a',
				'[data-arts-component-name="PSWP"] a', // Links in template galleries
			];

		// Element is outside barba wrapper
		if (!this.element.contains(el)) {
			return true;
		}

		if (url === '#') { // dummy link
			return true;
		}

		// Page anchor
		if (el.matches('[href*="#"]') && window.location.href === url.substring(0, url.indexOf('#'))) {
			return true;
		}

		// Page anchor
		if (el.matches('[href^="#"]')) {
			return true;
		}

		// custom rules from WordPress Customizer
		if (customRules) {
			exludeRules = [...exludeRules, ...customRules.split(',')];
			exludeRules = [...new Set(exludeRules)];
		}

		// check against array of rules to prevent
		return el.matches(exludeRules.join(','));
	}

	_customHeaders() {
		if (this.webpSupported) {
			return {
				'name': 'Accept',
				'value': 'image/webp'
			};
		}
	}

	_testWebP() {
		return new Promise((resolve) => {
			const webP = new Image();

			webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
			webP.onload = webP.onerror = () => {
				webP.height === 2 ? this.webpSupported = true : this.webpSupported = false;
				resolve(true);
			};
		});
	}

	_transitionStart() {
		this.running = true;

		this._setScrollRestoration();

		app.utilities.scrollLock(true);
		app.utilities.pageLock(true);
		document.activeElement.blur();

		this._setLoading(true);
	}

	_transitionEnd() {
		this.running = false;
		this.runningSeamlessTransition = false;

		app.utilities.scrollLock(false);
		app.utilities.pageLock(false);

		this._setScrollRestoration();

		ScrollTrigger.refresh();

		// refresh animation triggers
		// for Waypoints library
		if (typeof Waypoint !== 'undefined') {
			Waypoint.refreshAll();
		}

		if (!!app.lazy && typeof app.lazy.update === 'function') {
			app.lazy.update();
		}

		app.utilities.scrollToAnchorFromHash();

		this._setLoading(false);
	}

	_setLoading(loading = true) {
		this._toggleCursorProgress(loading);
		this._toggleLoadingIndicator(loading);
		this.element.classList.toggle('ajax-loading', loading);
	}

	_toggleCursorProgress(enabled = true) {
		if (!!this.options.cursorLoading) {
			this.element.classList.toggle('cursor-progress', enabled);
		}
	}

	_toggleLoadingIndicator(enabled = true) {
		if (this.elements.indicator && this.elements.indicator[0]) {
			gsap.to(this.elements.indicator[0], {
				autoAlpha: enabled ? 1 : 0,
				duration: 0.3,
				overwrite: true
			});
		}
	}

	_setScrollRestoration(newValue = 'manual') {
		ScrollTrigger.clearScrollMemory(newValue);
	}
}
