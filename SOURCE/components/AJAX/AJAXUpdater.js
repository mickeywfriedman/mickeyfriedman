class AJAXUpdater {
	static syncNextPage(data) {
		return new Promise((resolve, reject) => {
			Promise.all([
				AJAXUpdater._updateNodesAttributes(data),
				AJAXUpdater._updateBody(data),
				AJAXUpdater._updateHeadTags(data),
				AJAXUpdater._updateHeadStyles(data),
				AJAXUpdater._updateScripts(data),
				AJAXUpdater._updateTrackerGA(),
				AJAXUpdater._updateTrackerFBPixel(),
				AJAXUpdater._updateTrackerYaMetrika(),
				AJAXUpdater._updateCloudFlareEmailProtection()
			])
				.then(document.fonts.ready)
				.then(() => AJAXHelpers.resolveOnNextTick(resolve))
				.catch((e) => reject(e));
		});
	}

	/**
	 * Eval inline scripts in the new container
	 */
	static evalInlineScripts(data) {
		return new Promise((resolve) => {
			if (!!app.options.ajax.evalInlineContainerScripts) {
				AJAXUpdater._evalInlineScripts(data.next.container)
					.finally(() => resolve(true));
			} else {
				resolve(true);
			}
		});
	}

	static _evalInlineScripts(container) {
		return new Promise((resolve) => {
			if (!container) {
				resolve(true);
				return;
			}

			const
				readyPromises = [],
				excludeTypes = [
					'application/ld+json',
					'application/json'
				],
				scripts = [...container.querySelectorAll('script')].filter((script) => {
					const type = script.getAttribute('type');

					return !type || (type && !excludeTypes.includes(type));
				});

			if (scripts.length) {
				scripts.forEach((script) => {
					const task = scheduler.postTask(() => {
						try {
							window.eval(script.textContent);
						} catch (error) {
							console.warn(error);
						}
					});

					readyPromises.push(task);
				});
			}

			Promise.all(readyPromises)
				.finally(() => {
					resolve(true);
				});
		});
	}

	static autoPlayPausedVideos(data) {
		return new Promise((resolve) => {
			const
				videos = [...data.next.container.querySelectorAll('video[muted][autoplay]')],
				promises = [];

			if (videos.length) {
				videos.forEach((el) => {
					if (el.paused && typeof el.play === 'function') {
						const playPromise = el.play();

						if (playPromise !== undefined) {
							playPromise.then(() => {
								promises.push(playPromise);
							}).catch(() => {
								promises.push(playPromise);
							});
						}
					}
				});
			}

			Promise.all(promises).then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	}

	static updateComponents() {
		return new Promise((resolve) => {
			// Update persistent components
			app.componentsManager.instances.persistent.forEach((instance) => {
				if (instance && typeof instance.update === 'function') {
					instance.update();
				}
			});

			AJAXHelpers.resolveOnNextTick(resolve);
		});
	}

	static disposeComponents(data) {
		return new Promise((resolve) => {

			// Destroy disposable components
			app.componentsManager.instances.disposable.forEach((instance, index) => {
				if (data.current.container.contains(instance.element)) {
					AJAXUpdater.destroyInnerComponents(instance);

					if (instance && typeof instance.destroy === 'function') {
						instance.destroy();
					}

					app.componentsManager.instances.disposable[index] = null;
					delete app.componentsManager.instances.disposable[index];
				}
			});

			// Make disposable instances eligble for garbage collection
			app.componentsManager.instances.disposable = app.componentsManager.instances.disposable.filter(element => element !== null);

			AJAXHelpers.resolveOnNextTick(resolve);
		});
	}

	static destroyInnerComponents(instance) {
		if (instance.components.length) {
			instance.components.forEach((innerComponent) => {
				AJAXUpdater.destroyInnerComponents(innerComponent);
			});
		} else {
			if (typeof instance.destroy === 'function') {
				instance.destroy();
			}
		}
	}

	static _updateNodesAttributes(data) {
		return new Promise((resolve) => {
			const
				defaultNodesToUpdate = [
					'body',
					'#page-header',
					'#page-header .header__bar',
					'#page-header .menu-classic li',
					'#page-header .menu-overlay li',
					'#page-header .header__wrapper-overlay-menu'
				],
				nodesToUpdate = [...new Set([
					...defaultNodesToUpdate,
					...app.options.ajax.updateNodesAttributes.split(',')
				])]
					.map(selector => selector.trim())
					.filter(selector => selector.length > 0);

			nodesToUpdate.forEach((selector) => {
				let
					currentItems = [...document.querySelectorAll(selector)],
					nextItems = [...data.next.DOM.querySelectorAll(selector)];

				// different type of menu (overlay) found on the next page
				if (selector === '#page-header .menu-classic li' && !nextItems.length) {
					nextItems = [...data.next.DOM.querySelectorAll('#page-header .menu-overlay li')];
				}

				// different type of menu (classic) found on the next page
				if (selector === '#page-header .menu-overlay li' && !nextItems.length) {
					nextItems = [...data.next.DOM.querySelectorAll('#page-header .menu-classic li')];
				}

				// save menu position classes
				if (selector === '#page-header' && currentItems[0] && nextItems[0]) {
					const savedHeaderClassNames = [
						'header_classic-menu-left',
						'header_classic-menu-split-center',
						'header_classic-menu-center',
						'header_classic-menu-right',
						'header_overlay-logo-center-burger-right',
						'header_overlay-logo-left-burger-right',
						'header_overlay-logo-center-burger-left',
					];

					savedHeaderClassNames.forEach((className) => {
						if (currentItems[0].classList.contains(className)) {
							nextItems[0].classList.add(className);
						}
					});
				}

				if (nextItems.length) {
					AJAXUpdater._syncAttributes(currentItems, nextItems);
				}
			});

			resolve(true);
		});
	}

	static _updateBody(data) {
		return new Promise((resolve, reject) => {
			if (data.next.DOM.body && data.next.DOM.body.classList.contains('page-no-ajax')) {
				reject('Transition has been interrupted: Destination page requested a hard refresh.');
			} else {
				AJAXHelpers.resolveOnNextTick(resolve);
			}
		});
	}

	/**
	 * Update <head> tags
	 */
	static _updateHeadTags(data) {
		return new Promise((resolve, reject) => {
			let
				tagstoUpdate = [
					'meta[name="keywords"]',
					'meta[name="description"]',
					'meta[property^="og"]',
					'meta[name^="twitter"]',
					'meta[itemprop]',
					'link[itemprop]',
					'link[rel="prev"]',
					'link[rel="next"]',
					'link[rel="canonical"]',
					'link[rel="alternate"]',
					'link[rel="shortlink"]',
				];

			tagstoUpdate.forEach((selector) => {
				const
					currentElement = document.head.querySelector(selector),
					nextElement = data.next.DOM.head.querySelector(selector);

				if (currentElement && nextElement) { // both tags exist, update (replace) them with the new ones
					currentElement.replaceWith(nextElement);
				} else if (currentElement && !nextElement) { // tag doesn't exist on the next page, remove it
					currentElement.remove();
				} else if (!currentElement && nextElement) { // tag doesn't exist on the current page but it exists on the next page
					document.head.append(nextElement);
				}
			});

			AJAXHelpers.resolveOnNextTick(resolve);
		});
	}

	/**
	 * Load styles for new page
	 * Update inline styles in <head>
	 */
	static _updateHeadStyles(data) {
		let
			promises = [],
			stylesToUpdate = [
				'link[rel="stylesheet"][id]',
				'style[id]'
			],
			currentStyles = [...document.head.querySelectorAll(stylesToUpdate.join(', '))],
			nextStyles = [...data.next.DOM.querySelectorAll(stylesToUpdate.join(', '))];

		// Load & update <head> styles
		nextStyles.forEach((el) => {
			Promise.all(promises).then(() => {
				const
					currentElement = document.head.querySelector(`#${el.id}`),
					currentHref = currentElement ? currentElement.getAttribute('href') : null,
					nextHref = el.getAttribute('href'),
					refElement = currentElement ? [...document.head.children].filter((el) => el.isEqualNode(currentElement.previousElementSibling))[0] : currentElement;

				let isInlineStyle = false;

				if (el.innerHTML.length) {
					isInlineStyle = true;
				}

				// handle inline style
				if (isInlineStyle) {
					// inline style already exists so simply update it
					if (currentElement) {
						currentElement.textContent = el.textContent.trim();
					} else { // create new inline script element
						promises.push(app.assetsManager.load({
							type: 'style',
							id: el.id,
							inline: el.textContent,
							preload: false,
							refElement
						}));
					}

				} else { // handle style with [href] attribute

					// load style that's not present on the current page
					// or if it exists but has different href
					if (!currentElement || currentHref !== nextHref) {
						promises.push(app.assetsManager.load({
							type: 'style',
							id: el.id,
							src: nextHref,
							preload: false,
							refElement,
							cache: !(currentElement && currentElement.id === el.id) // duplicate ID element
						}));
					}
				}
			});
		});

		if (!!app.options.ajax.removeMissingStyles) {
			return new Promise((resolve) => {
				Promise.all(promises).then(() => {
					currentStyles.forEach((el) => {
						const nextElement = data.next.DOM.querySelector(`#${el.id}`);

						// Next style doesn't exist in current <head>
						// so remove it
						if (!nextElement) {
							el.remove();

							delete app.assetsManager.promises[el.id];
						}
					});

					AJAXHelpers.resolveOnNextTick(resolve);
				})
			});
		} else {
			return Promise.all(promises);
		}
	}

	static _updateScripts(data) {
		return new Promise((resolve) => {
			const
				promises = [],
				customNodes = AJAXHelpers.sanitizeSelector(app.options.ajax.updateScriptNodes) || [],
				nextScripts = [...data.next.DOM.querySelectorAll('script[id], script[src*="maps.googleapis.com/maps/api"]')];

			nextScripts.forEach((el) => {
				const
					currentElement = el.id ? document.body.querySelector(`#${el.id}`) : undefined;

				let isInlineScript = false;

				if (el.textContent.length) {
					isInlineScript = true;
				}

				// handle inline script
				if (isInlineScript) {
					// inline script with same ID already exists
					if (currentElement) {

						// update its contents only if it differs from the current script
						// don't update theme internal scripts
						if (currentElement.textContent !== el.textContent && !el.id.includes('asli')) {
							currentElement.textContent = el.textContent.trim();

							try {
								window.eval(currentElement.textContent);
							} catch (error) {
								console.warn(error);
							}
						}
					} else { // create new inline script element
						promises.push(app.assetsManager.load({
							type: 'script',
							id: el.id,
							inline: el.textContent.trim(),
							preload: false,
							// refElement
						}));
					}
				} else { // handle script with [src] attribute

					// load script that's not present on the current page
					if (!currentElement) {
						promises.push(app.assetsManager.load({
							type: 'script',
							id: el.id,
							src: el.src,
							preload: false
						}));
					} else if (customNodes.includes(el.id)) {

						// remove current script
						currentElement.remove();

						// re-load script ignoring cache
						promises.push(app.assetsManager.load({
							type: 'script',
							id: el.id,
							src: el.src,
							preload: false,
							cache: false
						}));
					}
				}
			});

			return Promise.all(promises).then(
				() => AJAXHelpers.resolveOnNextTick(resolve),
				() => AJAXHelpers.resolveOnNextTick(resolve)
			);
		});
	}

	static _syncAttributes(targetElements, sourceElements) {
		return new Promise((resolve) => {

			if (targetElements.length > 0 && sourceElements.length > 0 && targetElements.length === sourceElements.length) {
				targetElements.forEach((element, index) => {
					const
						targetAttributes = [...element.attributes].filter((attr) => attr.name !== 'style'),
						sourceAttributes = [...sourceElements[index].attributes].filter((attr) => attr.name !== 'style');

					if (sourceAttributes.length) {
						// remove attributes that are not present in source element
						targetAttributes.forEach((attr) => {
							if (!(attr.nodeName in sourceElements[index].attributes)) {
								element.removeAttribute(attr.nodeName);
							}
						});

						// sync attributes
						sourceAttributes.forEach((attr) => {
							if (attr.nodeName in sourceElements[index].attributes) {
								element.setAttribute(attr.nodeName, sourceElements[index].attributes[attr.nodeName].nodeValue);
							} else {
								element.removeAttribute(attr.nodeName);
							}
						});
					} else { // source element doesn't have any attributes present
						// ... so remove all attributes from the target element
						targetAttributes.forEach((attr) => element.removeAttribute(attr.name));
					}
				});
			}

			AJAXHelpers.resolveOnNextTick(resolve);
		});
	}

	static _updateTrackerGA() {
		return new Promise((resolve) => {
			if (typeof window.gtag === 'function' && typeof window.gaData === 'object' && Object.keys(window.gaData)[0] !== 'undefined') {
				const
					trackingID = Object.keys(window.gaData)[0],
					pageRelativePath = (window.location.href).replace(window.location.origin, '');

				gtag('js', new Date());
				gtag('config', trackingID, {
					'page_title': document.title,
					'page_path': pageRelativePath
				});
			}

			resolve(true);
		});
	}

	static _updateTrackerFBPixel() {
		return new Promise((resolve) => {
			if (typeof window.fbq === 'function') {
				fbq('track', 'PageView');
			}

			resolve(true);
		});
	}

	static _updateTrackerYaMetrika() {
		return new Promise((resolve) => {
			if (typeof window.ym === 'function') {
				function getYmTrackingNumber() {
					if (typeof window.Ya !== 'undefined' && typeof window.Ya.Metrika2) {
						return window.Ya.Metrika2.counters()[0].id || null;
					}

					if (typeof window.Ya !== 'undefined' && typeof window.Ya.Metrika) {
						return window.Ya.Metrika.counters()[0].id || null;
					}

					return null;
				}

				const trackingID = getYmTrackingNumber();

				ym(trackingID, 'hit', window.location.href, {
					title: document.title
				});
			}

			resolve(true);
		});
	}

	static _updateCloudFlareEmailProtection() {
		return new Promise((resolve) => {
			var HEADER = "/cdn-cgi/l/email-protection#",
				SPECIAL_SELECTOR = ".__cf_email__",
				SPECIAL_ATTRIBUTE = "data-cfemail",
				DIV = document.createElement("div");

			function error(e) {
				try {
					if ("undefined" == typeof console) return;
					"error" in console ? console.error(e) : console.log(e)
				} catch (e) { }
			}

			function sanitize(e) {
				DIV.innerHTML = '<a href="' + e.replace(/"/g, "&quot;") + '"></a>';
				return DIV.childNodes[0].getAttribute("href") || ""
			}

			function nextHex(hexstr, skip) {
				return parseInt(hexstr.substr(skip, 2), 16)
			}

			function decrypt(ciphertext, skip) {
				for (var out = "", magic = nextHex(ciphertext, skip), i = skip + 2; i < ciphertext.length; i += 2) {
					var hex = nextHex(ciphertext, i) ^ magic;
					out += String.fromCharCode(hex)
				}
				try {
					out = decodeURIComponent(escape(out))
				} catch (err) {
					error(err)
				}
				return sanitize(out)
			}

			function decryptLinks(doc) {
				for (var links = doc.querySelectorAll("a"), c = 0; c < links.length; c++) try {
					var currentLink = links[c];
					var a = currentLink.href.indexOf(HEADER);
					a > -1 && (currentLink.href = "mailto:" + decrypt(currentLink.href, a + HEADER.length))
				} catch (err) {
					error(err)
				}
			}

			function decryptOthers(doc) {
				for (var specials = doc.querySelectorAll(SPECIAL_SELECTOR), c = 0; c < specials.length; c++) try {
					var current = specials[c],
						parent = current.parentNode,
						ciphertext = current.getAttribute(SPECIAL_ATTRIBUTE);
					if (ciphertext) {
						var email = decrypt(ciphertext, 0),
							tmpDOM = document.createTextNode(email);
						parent.replaceChild(tmpDOM, current)
					}
				} catch (err) {
					error(err)
				}
			}

			function decryptTemplates(doc) {
				for (var templates = doc.querySelectorAll("template"), n = 0; n < templates.length; n++) try {
					init(templates[n].content)
				} catch (err) {
					error(err)
				}
			}

			function init(doc) {
				try {
					decryptLinks(doc);
					decryptOthers(doc);
					decryptTemplates(doc);
				} catch (err) {
					error(err)
				}
			}

			init(document);

			(function () {
				var e = document.currentScript || document.scripts[document.scripts.length - 1];
				e.parentNode.removeChild(e);

				resolve(true);
			})();
		});
	}
}
