import { ICardProduct, IOrder, ISuccess } from '../../types/index';
import { Api, ApiListResponse } from '../base/api';

export interface ILarekAPI {
	getProductList: () => Promise<ICardProduct[]>;
	getProduct: (id: string) => Promise<ICardProduct>;
	createOrder: (order: IOrder) => Promise<ISuccess>;
}

export class LarekAPI extends Api implements ILarekAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<ICardProduct[]> {
		return this.get('/product').then((data: ApiListResponse<ICardProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getProduct(id: string): Promise<ICardProduct> {
		return this.get(`/product/${id}`).then((item: ICardProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	createOrder(order: IOrder): Promise<ISuccess> {
		return this.post('/order', order).then((data: ISuccess) => data);
	}
}
