const AJAXTransitionGeneral = {
	name: 'general',

	before: (data) => {
		return AJAXLifecycle.startTransition(data);
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.buildContainersDOM(data)
				.then(() => AJAXLifecycle.loadOnlyFirstComponent(data))
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			let
				duration = AJAXHelpers.getTransitionDuration(),
				ease = AJAXHelpers.getTransitionEase();
			AJAXAnimations.animateCurtains(data, { duration, ease })
				.then(() => {
					AJAXHelpers.resolveOnNextTick(resolve);
				});
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			AJAXLifecycle.initNewPage(data)
				.then(() => AJAXLifecycle.loadRestComponents(data))
				.then(() => AJAXHelpers.resolveOnNextTick(resolve));
		});
	},

	after: (data) => {
		return AJAXLifecycle.endTransition(data);
	}
};
