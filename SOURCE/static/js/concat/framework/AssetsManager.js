class AssetsManager {
	constructor() {
		this.promises = [];
	}

	load({
		type = undefined, // script | stylesheet
		src = null,
		id = null, // id attribute in DOM
		inline = null,
		preload = false,
		refElement,
		version = null,
		timeout = 30000,
		cache = true,
		cb = null
	}) {
		return new Promise((resolve, reject) => {
			// Don't load asset that is pending to load
			if (cache && id in this.promises) {
				// return existing loading promise
				this.promises[id].then(resolve, reject);
				return;
			}

			// CSS
			if (type === 'style') {
				const stylePromise = this._loadStyle({
					src,
					id,
					inline,
					preload,
					refElement,
					timeout,
					version,
					cb
				});

				this.promises[id] = stylePromise;
				return stylePromise.then(resolve, reject);

			} else if (type === 'script') { // JS
				const scriptPromise = this._loadScript({
					src,
					id,
					inline,
					preload,
					refElement,
					timeout,
					version,
					cb
				});

				this.promises[id] = scriptPromise;

				return scriptPromise.then(resolve, reject);

			} else { // Unknown type
				reject(new TypeError('Resource type "style" or "script" is missing.'));
			}
		});
	}

	_loadScript({
		src = null,
		id = null,
		inline = null,
		preload = false,
		refElement = document.body,
		version = null,
		timeout = 15000,
		cb = null
	}) {
		return new Promise((resolve, reject) => {
			const
				element = document.querySelector(`script[src="${src}"]`),
				head = document.getElementsByTagName('head')[0];

			let script, timer, preloadEl;

			if ((typeof element === 'undefined' || element === null) && !inline) {

				if (src && version) {
					src += `?ver=${version}`;
				}

				if (src && preload) {
					preloadEl = document.createElement('link');
					preloadEl.setAttribute('rel', 'preload');
					preloadEl.setAttribute('href', src);
					preloadEl.setAttribute('as', 'script');
					preloadEl.setAttribute('type', 'text/javascript');
					head.prepend(preloadEl);
				}

				script = document.createElement('script');
				script.setAttribute('type', 'text/javascript');

				if (src) {
					script.setAttribute('async', 'async');
					script.setAttribute('src', src);
					script.setAttribute('crossorigin', 'anonymous');
				}

				if (!id) {
					const timestamp = Math.round(new Date().getTime() / 1000);
					id = `ajax-asset-${timestamp}-js`;
				}

				script.setAttribute('id', id);

				if (typeof inline === 'string' && inline.length) {
					script.innerHTML = inline;
				}

				refElement.append(script);

				if (src) {
					script.onerror = (error) => {
						cleanup();
						refElement.removeChild(script);
						script = null;
						reject(new Error(`A network error occured while trying to load resouce ${src}`));
					}

					if (script.onreadystatechange === undefined) {
						script.onload = onload;
					} else {
						script.onreadystatechange = onload;
					}

					timer = setTimeout(script.onerror, timeout);

				} else {
					resolve(script);
				}

			} else {
				resolve(element);
			}

			function cleanup() {
				clearTimeout(timer);
				timer = null;
				script.onerror = script.onreadystatechange = script.onload = null;
			}

			function onload() {
				cleanup();
				if (!script.onreadystatechange || (script.readyState && script.readyState === 'complete')) {
					if (typeof cb === 'function') {
						cb();
					}

					resolve(script);
					return;
				}
			}
		});
	}

	_loadStyle({
		src = null,
		id = null,
		inline = null,
		preload = false,
		refElement,
		version = null,
		timeout = 15000,
		cb = null
	}) {
		return new Promise((resolve, reject) => {
			const isInlineStyle = typeof inline === 'string' && inline.length;

			if (!id) {
				reject(new TypeError('Resource ID attribute is missing.'))
			}

			const sameIdElement = document.getElementById(id);

			let
				link = isInlineStyle ? document.createElement('style') : document.createElement('link'),
				timer,
				sheet,
				cssRules,
				preloadEl,
				c = (timeout || 10) * 100;

			if (src && version) {
				src += `?ver=${version}`;
			}

			if (src && preload) {
				preloadEl = document.createElement('link');
				preloadEl.setAttribute('rel', 'preload');
				preloadEl.setAttribute('href', src);
				preloadEl.setAttribute('as', 'style');
				preloadEl.setAttribute('type', 'text/css');
				document.head.prepend(preloadEl);
			}

			if (isInlineStyle) {
				link.innerHTML = inline;
				link.setAttribute('id', id);
				link.setAttribute('type', 'text/css');
			} else {
				link.setAttribute('rel', 'stylesheet');
				link.setAttribute('id', id);
				link.setAttribute('type', 'text/css');
				link.setAttribute('href', src);

				if (!preload) {
					link.setAttribute('crossorigin', 'anonymous');
				}
			}

			if (typeof refElement !== 'undefined' && refElement !== null) {
				refElement.insertAdjacentElement('afterend', link);
			} else {
				document.head.append(link);
			}

			link.onerror = function (error) {
				if (timer) {
					clearInterval(timer);
				}
				timer = null;

				reject(new Error(`A network error occured while trying to load resouce ${src}`));
			};

			if ('sheet' in link) {
				sheet = 'sheet';
				cssRules = 'cssRules';
			} else {
				sheet = 'styleSheet';
				cssRules = 'rules';
			}

			timer = setInterval(function () {
				try {
					if (link[sheet] && link[sheet][cssRules].length) {
						clearInterval(timer);
						timer = null;

						if (typeof cb === 'function') {
							cb();
						}

						resolve(link);

						// Remove old element with duplicate ID
						if (sameIdElement) {
							sameIdElement.remove();
						}
						return;
					}
				} catch (e) { }

				if (c-- < 0) {
					clearInterval(timer);
					timer = null;
					reject(new Error(`A network error occured while trying to load resouce ${src}`));
				}
			}, 10);


		});
	}

	injectPreload({
		src = null,
		refElement = document.head.querySelector('meta[charset]'),
		rel = 'prefetch', // prefetch or preload
		crossorigin = 'anonymous',
		as = 'script',
		type = 'application/javascript'
	} = {}) {
		// Don't preload if link element already exist
		if (src && !document.head.querySelector(`link[rel="${rel}"][href="${src}"]`) && !document.querySelector(`script[src="${src}"]`)) {
			const el = document.createElement('link');

			el.setAttribute('href', src);
			el.setAttribute('rel', rel);
			el.setAttribute('as', as);
			el.setAttribute('crossorigin', crossorigin);
			el.setAttribute('type', type);

			if (refElement) {
				refElement.insertAdjacentElement('afterend', el);
			} else {
				document.head.prepend(el);
			}
		}
	}
};
