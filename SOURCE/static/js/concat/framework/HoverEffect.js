class HoverEffect {
	constructor() {
		this._handlers = {
			hoverIn: this._onMouseEnter.bind(this),
			hoverOut: this._onMouseLeave.bind(this),
			prevent: this.preventDefault.bind(this)
		};

		this.selectorHoverSelf = '[data-hover-class]';
		this.attributeHoverSelf = 'data-hover-class';

		this.selectorHoverGroup = '[data-hover-group-class]';
		this.selectorHoverGroupElements = `${this.selectorHoverGroup} a`;
		this.attributeHoverGroup = 'data-hover-group-class';

		this.attachEvents(document, this._handlers.hoverIn, this._handlers.hoverOut);
	}

	_onMouseEnter(event) {
		const target = event.target;

		if (target instanceof HTMLElement) {
			this._toggleHoverSelfClass({
				element: target,
				toggle: true
			});

			this._toggleHoverGroupClass({
				element: target,
				toggle: true
			});
		}
	}

	_onMouseLeave(event) {
		const target = event.target;

		if (target instanceof HTMLElement) {
			this._toggleHoverSelfClass({
				element: target,
				selector: this.selectorHoverSelf,
				attribute: this.attributeHoverSelf,
				toggle: false
			});

			this._toggleHoverGroupClass({
				element: target,
				toggle: false
			});
		}
	}

	_toggleHoverSelfClass({
		element,
		toggle
	} = {
			element: null,
			toggle: false
		}) {
		const el = element.closest(this.selectorHoverSelf);

		if (el) {
			const hoverClass = el.getAttribute(this.attributeHoverSelf);

			if (hoverClass.length) {
				el.classList.toggle(hoverClass, toggle);
			}
		}
	}

	_toggleHoverGroupClass({
		element,
		toggle
	} = {
			element: null,
			toggle: false
		}) {
		const el = element.closest(this.selectorHoverGroupElements);

		if (el) {
			const parent = element.closest(this.selectorHoverGroup);

			if (parent) {
				const hoverClass = parent.getAttribute(this.attributeHoverGroup);

				if (hoverClass.length) {
					parent.classList.toggle(hoverClass, toggle);
				}
			}
		}
	}

	attachEvents(element, onHoverInCallback, onHoverOutCallback) {
		if (element) {
			if (typeof onHoverInCallback === 'function') {
				element.addEventListener('mouseenter', onHoverInCallback, true);
				element.addEventListener('touchstart', onHoverInCallback, true);

				element.addEventListener('webkitmouseforcewillbegin', this._handlers.prevent);
				element.addEventListener('webkitmouseforcedown', this._handlers.prevent);
				element.addEventListener('webkitmouseforceup', this._handlers.prevent);
				element.addEventListener('webkitmouseforcechanged', this._handlers.prevent);
			}

			if (typeof onHoverOutCallback === 'function') {
				element.addEventListener('mouseleave', onHoverOutCallback, true);
				element.addEventListener('touchend', onHoverOutCallback, true);
				element.addEventListener('touchcancel', onHoverOutCallback, true);
			}
		}
	}

	detachEvents(element, onHoverInCallback, onHoverOutCallback) {
		if (element) {
			if (typeof onHoverInCallback === 'function') {
				element.removeEventListener('mouseenter', onHoverInCallback, true);
				element.removeEventListener('touchstart', onHoverInCallback, true);

				element.removeEventListener('webkitmouseforcewillbegin', this._handlers.prevent);
				element.removeEventListener('webkitmouseforcedown', this._handlers.prevent);
				element.removeEventListener('webkitmouseforceup', this._handlers.prevent);
				element.removeEventListener('webkitmouseforcechanged', this._handlers.prevent);
			}

			if (typeof onHoverOutCallback === 'function') {
				element.removeEventListener('mouseleave', onHoverOutCallback, true);
				element.removeEventListener('touchend', onHoverOutCallback, true);
				element.removeEventListener('touchcancel', onHoverOutCallback, true);
			}
		}
	}

	preventDefault(event) {
		event.stopPropagation();
		event.preventDefault();
	}
}
