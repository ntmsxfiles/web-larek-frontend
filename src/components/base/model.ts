import { IEvents } from './events';
import { Component } from './Component';

export class ViewComponent<T> extends Component<T> {
	constructor(container: HTMLElement, protected readonly events: IEvents) {
		super(container);
	}
}
