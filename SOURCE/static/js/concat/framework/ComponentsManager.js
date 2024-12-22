class ComponentsManager {
	constructor() {
		this.instances = {
			persistent: [],
			disposable: [],
		};
	}

	init({
		scope = document,
		parent = null,
		loadInnerComponents = true,
		storage = this.instances.disposable,
		selector = ':scope [data-arts-component-name]:not(:scope [data-arts-component-name] [data-arts-component-name])',
		loadOnlyFirst = false,
		nameAttribute = 'data-arts-component-name',
		optionsAttribute = 'data-arts-component-options',
	}) {
		if (!scope) {
			return [];
		}

		let
			nodes = loadOnlyFirst ? [scope.querySelector(selector)] : [...scope.querySelectorAll(selector)],
			promises = [];

		if (!parent) {
			nodes = nodes.filter(el => el && !el.matches(':scope [data-arts-component-name] [data-arts-component-name]'));

			if (!loadOnlyFirst) {
				nodes[0] = null;
			}
		}

		if (nodes && nodes.length) {
			nodes.forEach((el) => {
				const loader = this.loadComponent({
					el,
					parent,
					storage,
					loadInnerComponents,
					nameAttribute,
					optionsAttribute
				});

				promises.push(loader);
			});
		}

		return promises;
	}

	loadComponent({
		el,
		loadInnerComponents,
		parent,
		storage,
		name = undefined,
		nameAttribute = 'data-arts-component-name',
		optionsAttribute = 'data-arts-component-options',
		options = undefined,
	}) {
		if (!el) {
			return new Promise((resolve) => {
				resolve(true);
			});
		}

		const
			componentName = name || el.getAttribute(nameAttribute),
			attrOptions = options || el.getAttribute(optionsAttribute);

		return new Promise((resolve, reject) => {
			if (typeof window[componentName] !== 'undefined') {
				const instance = new window[componentName]({
					name: componentName,
					loadInnerComponents,
					parent,
					element: el,
					options: attrOptions
				});

				storage.push(instance);

				instance.ready.then(() => resolve(true));
			} else if (app.components[componentName]) {
				this.load({
					properties: app.components[componentName],
				})
					.then((module) => {
						if (typeof module === 'object' && 'default' in module) {
							const instance = new module.default({
								name: componentName,
								loadInnerComponents,
								parent,
								element: el,
								options: attrOptions
							});

							storage.push(instance);

							instance.ready.then(() => resolve(true));
						} else {
							resolve(true);
						}
					});
			} else {
				console.error(`Component "${componentName}" is not recognized`);
				resolve(true);
			}
		});
	}

	load({
		properties = []
	}) {
		const
			depsPromises = [],
			filesPromises = [];

		return new Promise((resolve) => {
			if ('dependencies' in properties) {
				properties.dependencies.forEach((dep) => {
					if (dep in app.assets) {
						app.assets[dep].forEach((resource) => {
							// depsPromises.push(import(resource));
							depsPromises.push(app.assetsManager.load(resource));
						});
					}
				});
			}

			if ('files' in properties) {
				properties.files.forEach((resource) => {
					filesPromises.push(app.assetsManager.load(resource));
				});
			}

			Promise.all(depsPromises)
				.then(() => Promise.all(filesPromises))
				.then(() => typeof properties.file === 'string' ? import(properties.file) : {})
				.then(resolve);
		});
	}

	getComponentByName(name) {
		return this.instances.persistent.filter(instance => instance.name.toLowerCase() === name.toLowerCase())[0];
	}
}
