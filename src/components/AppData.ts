import { IEvents } from './base/events';
import {
	FormErrors,
	IBasket,
	ICardProduct,
	TOrderInfo,
	TPaymentMethod,
} from '../types';

export class AppData {
	items: ICardProduct[] = [];
	preview: ICardProduct | null = null;
	basket: IBasket = {
		items: [],
		total: 0,
	};
	order: TOrderInfo = {
		email: '',
		phone: '',
		address: '',
		payment: 'card',
	};
	formErrors: FormErrors = {};

	constructor(protected events: IEvents) {}

	setItems(items: ICardProduct[]) {
		this.items = items;
		this.events.emit('items:change', this.items);
	}

	setPreview(item: ICardProduct) {
		this.preview = item;
		this.events.emit('preview:change', this.preview);
	}

	isInBasket(item: ICardProduct) {
		return this.basket.items.includes(item.id);
	}

	addToBasket(item: ICardProduct) {
		this.basket.items.push(item.id);
		this.basket.total += item.price;
		this.events.emit('basket:change', this.basket);
	}

	removeFromBasket(item: ICardProduct) {
		this.basket.items = this.basket.items.filter((id) => id !== item.id);
		this.basket.total -= item.price;
		this.events.emit('basket:change', this.basket);
	}

	clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.events.emit('basket:change');
	}

	setPayment(method: TPaymentMethod) {
		this.order.payment = method;
	}

	clearOrder() {
		this.order = {
			email: '',
			phone: '',
			address: '',
			payment: 'card',
		};
	}

	setOrderField(field: keyof TOrderInfo, value: string) {
		if (field === 'payment') {
			this.setPayment(value as TPaymentMethod);
		} else {
			this.order[field] = value;
		}
	}

	validateOrderForm() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContactsForm() {
		const EMAIL_REGEXP =
			/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
		const TEL_REGEXP =
			/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		} else if (!EMAIL_REGEXP.test(this.order.email)) {
			errors.email = 'Неправильно указан email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!TEL_REGEXP.test(this.order.phone)) {
			errors.phone = 'Неправильно указан телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactsFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
