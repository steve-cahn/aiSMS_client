import constants from './constants';

const setSocket = socket => ({
	type: constants.SOCKET,
	socket
});

const setUser = user => ({
	type: constants.USER,
	user
});

export default {
	setSocket,
	setUser
};
