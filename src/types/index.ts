export interface ICardProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export type TPaymentMethod = 'cash' | 'card';

export interface IOrder {
	payment: TPaymentMethod;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IBasket {
	items: string[];
	total: number;
}

export type TOrderInfo = Pick<
	IOrder,
	'payment' | 'email' | 'phone' | 'address'
>;

export type TOrderAddress = Pick<IOrder, 'payment' | 'address'>;

export type TOrderContacts = Pick<IOrder, 'email' | 'phone'>;

export type FormErrors = Partial<Record<keyof TOrderInfo, string>>;

export interface ISuccess {
	id: string;
	total: number;
}
