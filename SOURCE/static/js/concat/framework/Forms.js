class Forms {
	constructor() {
		this.forms = 'form';
		this.input = 'input-float__input';
		this.inputClassNotEmpty = 'input-float__input_not-empty';
		this.inputClassFocused = 'input-float__input_focused';
		this.inputParent = 'wpcf7-form-control-wrap';

		this._handlers = {
			focusIn: this._onFocusIn.bind(this),
			focusOut: this._onFocusOut.bind(this),
			reset: this._onReset.bind(this),
		};

		this.init();
	}

	init() {
		this._floatLabels();
		this._attachEvents();
	}

	_floatLabels() {
		const inputs = [...document.querySelectorAll(`.${this.input}`)];

		inputs.forEach((el) => {
			const controlWrapper = el.closest(`.${this.inputParent}`);

			// Not empty value
			if (el.value && el.value.length) {
				this._setNotEmptyValue(el, controlWrapper);
				// Empty value
			} else {
				this._setEmptyValue(el, controlWrapper);
			}

			// Has placeholder & empty value
			if ((el.placeholder && el.placeholder.length) && !(el.value && el.value.length)) {
				this._setNotEmptyValue(el, controlWrapper);
			}
		});
	}

	_setNotEmptyValue(el, controlWrapper) {
		if (el) {
			el.classList.add(this.inputClassNotEmpty);
		}

		if (controlWrapper) {
			controlWrapper.classList.add(this.inputClassNotEmpty);
		}
	}

	_setEmptyValue(el, controlWrapper) {
		if (el) {
			el.classList.remove(this.inputClassFocused, this.inputClassNotEmpty);
		}

		if (controlWrapper) {
			controlWrapper.classList.remove(this.inputClassFocused, this.inputClassNotEmpty);
		}
	}

	_setFocus(el, controlWrapper) {
		if (el) {
			el.classList.add(this.inputClassFocused);
			el.classList.remove(this.inputClassNotEmpty);
		}

		if (controlWrapper) {
			controlWrapper.classList.add(this.inputClassFocused);
			controlWrapper.classList.remove(this.inputClassNotEmpty);
		}
	}

	_removeFocus(el, controlWrapper) {
		if (el) {
			el.classList.remove(this.inputClassFocused);
		}

		if (controlWrapper) {
			controlWrapper.classList.remove(this.inputClassFocused);
		}
	}

	_isTargetInput(target) {
		return target.classList && target.classList.contains(this.input);
	}

	_isTargetForm(target) {
		return target.tagName === 'FORM';
	}

	_attachEvents() {
		window.addEventListener('focusin', this._handlers.focusIn);
		window.addEventListener('focusout', this._handlers.focusOut);
		window.addEventListener('reset', this._handlers.reset);
	}

	_detachEvents() {
		window.removeEventListener('focusin', this._handlers.focusIn);
		window.removeEventListener('focusout', this._handlers.focusOut);
		window.removeEventListener('reset', this._handlers.reset);
	}

	_onFocusIn(event) {
		const target = event.target;

		if (this._isTargetInput(target)) {
			const controlWrapper = target.closest(`.${this.inputParent}`);

			this._setFocus(target, controlWrapper);
		}
	}

	_onFocusOut(event) {
		const target = event.target;

		if (this._isTargetInput(target)) {
			const controlWrapper = target.closest(`.${this.inputParent}`);

			// not empty value
			if (target.value && target.value.length) {
				this._setNotEmptyValue(target, controlWrapper);
			} else {
				// has placeholder & empty value
				if (target.placeholder && target.placeholder.length) {
					this._setNotEmptyValue(target, controlWrapper);
				}

				this._removeFocus(target, controlWrapper);
			}
		}
	}

	_onReset(event) {
		const target = event.target;

		if (this._isTargetForm(target)) {
			[...target.querySelectorAll(`.${this.input}`)].forEach((el) => {
				const controlWrapper = el.closest(`.${this.inputParent}`);

				el.classList.remove(this.inputClassFocused, this.inputClassNotEmpty);

				if (controlWrapper) {
					controlWrapper.classList.remove(this.inputClassFocused, this.inputClassNotEmpty);
				}
			});
		}
	}
}
