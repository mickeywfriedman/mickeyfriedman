class AJAXLifecycle {
	static startTransition() {
		return new Promise((resolve) => {
			AJAXHelpers.dispatchEvent('arts/barba/transition/start');
			AJAXHelpers.resolveOnNextTick(resolve);
		});
	}

	static endTransition(data) {
		return new Promise((resolve) => {
			AJAXHelpers.cleanBody()
				.then(() => AJAXUpdater.autoPlayPausedVideos(data))
				.then(() => {
					AJAXHelpers.dispatchEvent('arts/barba/transition/end/before');

					AJAXHelpers.cleanContent()
						.then(() => AJAXHelpers.removeClonedElements())
						.then(() => {
							AJAXHelpers.dispatchEvent('arts/barba/transition/end');
							AJAXHelpers.resolveOnNextTick(resolve);
						});
				});
		});
	}

	static initNewPage(data) {
		return new Promise((resolve, reject) => {
			AJAXHelpers.dispatchEvent('arts/barba/transition/init/before');

			AJAXAnimations.killAll(data);

			AJAXUpdater.disposeComponents(data);

			data.current.content.innerHTML = '';

			app.containerEl = data.next.container;
			app.contentEl = data.next.content;

			AJAXHelpers.resetScrollPosition()
				.then(() => AJAXUpdater.syncNextPage(data))
				.then(() => AJAXUpdater.evalInlineScripts(data))
				.then(() => AJAXUpdater.autoPlayPausedVideos(data))
				.then(() => AJAXUpdater.updateComponents())
				.then(() => AJAXHelpers.cleanContainers(data))
				.then(() => {
					return new Promise((res) => {
						// Emit "DOMContentLoaded" ready event
						AJAXHelpers.dispatchEvent('DOMContentLoaded', {
							bubbles: true,
							cancelable: true
						});

						// Emit "load" event
						AJAXHelpers.dispatchEvent('load', {
							bubbles: true,
							cancelable: true
						}, window);

						AJAXHelpers.dispatchEvent('arts/barba/transition/init/after');

						AJAXHelpers.resolveOnNextTick(res);
					});
				})
				.then(() => AJAXHelpers.resolveOnNextTick(resolve))
				.catch((e) => reject(e));
		}).catch((e) => { // fallback hard refresh if transition failed
			console.warn(e);
			barba.force(data.next.url.href);
		});
	}

	static initNewPageFlyingImageBefore(data) {
		return new Promise((resolve, reject) => {
			app.containerEl = data.next.container;
			app.contentEl = data.next.content;

			AJAXUpdater.syncNextPage(data)
				.then(() => AJAXUpdater.evalInlineScripts(data))
				.then(() => AJAXUpdater.autoPlayPausedVideos(data))
				.then(() => AJAXUpdater.updateComponents())
				.then(() => AJAXHelpers.cleanContainers(data))
				.then(() => {
					AJAXHelpers.dispatchEvent('arts/barba/transition/init/before');

					// ScrollTrigger.clearScrollMemory();
					AJAXAnimations.updateAll(data);

					AJAXHelpers.resolveOnNextTick(resolve);
				})
				.catch((e) => reject(e));
		}).catch((e) => { // fallback hard refresh if transition failed
			console.warn(e);
			barba.force(data.next.url.href);
		});
	}

	static initNewPageFlyingImageAfter(data) {
		return new Promise((resolve) => {
			AJAXAnimations.killAll(data);

			AJAXUpdater.disposeComponents(data);

			if (data.current.container) {
				data.current.content.innerHTML = '';
			}

			AJAXHelpers.cleanContainers(data).then(() => {
				// Emit "DOMContentLoaded" ready event
				AJAXHelpers.dispatchEvent('DOMContentLoaded', {
					bubbles: true,
					cancelable: true
				});

				// Emit "load" event
				AJAXHelpers.dispatchEvent('load', {
					bubbles: true,
					cancelable: true
				}, window);

				AJAXHelpers.dispatchEvent('arts/barba/transition/init/after');

				AJAXHelpers.resolveOnNextTick(resolve);
			});
		});
	}

	static buildContainersDOM(data) {
		return new Promise((resolve, reject) => {
			const parser = new DOMParser();

			const parseCurrentContainerTask = scheduler.postTask(() => {
				data.current.DOM = parser.parseFromString(data.current.html, 'text/html');
			});

			const parseNextContainerTask = scheduler.postTask(() => {
				data.next.DOM = parser.parseFromString(data.next.html, 'text/html');
			});

			Promise.all([
				parseCurrentContainerTask,
				parseNextContainerTask
			]).finally(() => {
				if (data.next.DOM && data.next.container) {
					data.current.content = data.current.container.querySelector('#page-wrapper__content');
					data.next.content = data.next.container.querySelector('#page-wrapper__content');

					AJAXHelpers.dispatchEvent('arts/barba/transition/dom');

					if (!!app.lazy && typeof app.lazy.update === 'function') {
						app.lazy.update();
					}

					app.injectPreloadTags({ container: data.next.content }).then(() => resolve(true), () => resolve(true));
				} else {
					reject(`Next page container not found.`);
				}
			});
		}).catch((e) => {
			console.warn(e);
			barba.force(data.next.url.href);
		});
	}

	static loadOnlyFirstComponent(data) {
		return new Promise((resolve) => {
			Promise.all(app.componentsManager.init({
				scope: data.next.container,
				loadOnlyFirst: true
			})).then(() => resolve(true))
		});
	}

	static loadRestComponents(data) {
		return new Promise((resolve) => {
			Promise.all(app.componentsManager.init({
				scope: data.next.container
			})).then(() => resolve(true));
		});
	}
}
