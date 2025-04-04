import './scss/styles.scss';
import { AppData } from './components/AppData';
import { Card } from './components/Card';
import { Order } from './components/Order';
import { Page } from './components/common/Page';
import { LarekAPI } from './components/common/LarekApi';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Contacts } from './components/Contact';
import { ICardProduct, TOrderInfo } from './types';

const api = new LarekAPI(CDN_URL, API_URL);

// Подготовка шаблонов
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const modalCardTemplate =
	ensureElement<HTMLTemplateElement>('#modal-container');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Инициализация событий
const events = new EventEmitter();

// Данные приложения
const appData = new AppData(events);

// Элементы интерфейса
const page = new Page(document.body, events);
const modal = new Modal(modalCardTemplate, events);
const basket = new Basket(events);
const contactsForm = new Contacts(cloneTemplate(contactsTemplate), events);
const orderForm = new Order(cloneTemplate(orderTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events, {
	onClick: () => modal.close(),
});

// Логика приложения
events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('card:select', (cardData: ICardProduct) => {
	appData.setPreview(cardData);
});

events.on('items:change', (products: ICardProduct[]) => {
	page.catalog = products.map((product) => {
		const productCard = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', product),
		});
		return productCard.render(product);
	});
});

events.on('preview:change', (product: ICardProduct) => {
	const previewCard = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			const isInBasket = appData.isInBasket(product);
			if (isInBasket) {
				appData.removeFromBasket(product);
				previewCard.button = 'В корзину';
			} else {
				appData.addToBasket(product);
				previewCard.button = 'Удалить из корзины';
			}
		},
	});

	previewCard.button = appData.isInBasket(product)
		? 'Удалить из корзины'
		: 'В корзину';
	modal.render({ content: previewCard.render(product) });
});

events.on('basket:change', () => {
	page.counter = appData.basket.items.length;
	basket.items = appData.basket.items.map((itemId) => {
		const product = appData.items.find((item) => item.id === itemId);
		const basketCard = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => appData.removeFromBasket(product),
		});
		return basketCard.render(product);
	});

	basket.total = appData.basket.total;
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

events.on('order:open', () => {
	appData.clearOrder();
	modal.render({
		content: orderForm.render({
			payment: 'card',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('order:submit', () => {
	modal.render({
		content: contactsForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on(
	/^order\..*:change$/,
	(data: { field: keyof TOrderInfo; value: string }) => {
		appData.setOrderField(data.field, data.value);
		appData.validateOrderForm();
	}
);

events.on(
	/^contacts\..*:change$/,
	(data: { field: keyof TOrderInfo; value: string }) => {
		appData.setOrderField(data.field, data.value);
		appData.validateContactsForm();
	}
);

events.on('orderFormErrors:change', (error: Partial<TOrderInfo>) => {
	const { payment, address } = error;
	const formIsValid = !payment && !address;
	orderForm.valid = formIsValid;
	if (!formIsValid) {
		orderForm.errors = address;
	} else {
		orderForm.errors = '';
	}
});

events.on('contactsFormErrors:change', (error: Partial<TOrderInfo>) => {
	const { email, phone } = error;
	const formIsValid = !email && !phone;
	contactsForm.valid = formIsValid;
	if (!formIsValid) {
		contactsForm.errors = email || phone;
	} else {
		contactsForm.errors = '';
	}
});

events.on('contacts:submit', () => {
	api
		.createOrder({ ...appData.basket, ...appData.order })
		.then((result) => {
			modal.render({
				content: success.render(),
			});
			success.total = result.total;
			appData.clearBasket();
			appData.clearOrder();
		})
		.catch(console.error);
});

api
	.getProductList()
	.then((items) => appData.setItems(items))
	.catch(console.error);
