import { createStore } from 'redux';
import constants from './constants';

const initialState = {
	socket: null,
	user: null
};

const reducer = (state = initialState, action) => {
	if (action.type === constants.SOCKET) {
		return { ...state, socket: action.socket };
	} else if (action.type === constants.USER) {
		return { ...state, user: action.user };
	}

	return state;
};

const store = createStore(reducer);

export default store;
