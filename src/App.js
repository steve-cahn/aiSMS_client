import React, { useEffect } from 'react';
import './App.scss';

import io from 'socket.io-client';
import { connect } from 'react-redux';
import actions from './store/actions';

import Messages from './components/Messages';
import Login from './components/Login';

import { Switch, Route } from 'react-router-dom';

function App(props) {
	useEffect(() => {
		props.setSocket(io(process.env.REACT_APP_API_URL));
	}, []);

	return (
		<div className='App'>
			<Switch>
				<Route component={Messages} path='/message' />
				<Route component={Login} path='/' />
			</Switch>
		</div>
	);
}

const mapDispatchtoProps = dispatch => {
	return {
		setSocket: article => dispatch(actions.setSocket(article)),
		setUser: article => dispatch(actions.setUser(article))
	};
};

export default connect(
	null,
	mapDispatchtoProps
)(App);
