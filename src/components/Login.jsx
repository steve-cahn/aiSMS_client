import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from '../store/actions';
import {
	ToastsContainer,
	ToastsStore,
	ToastsContainerPosition
} from 'react-toasts';

import http from '../http';

import './login.scss';

const Login = props => {
	const [numberInput, setNumberInput] = useState('');

	const numberInputChangeHandler = e => {
		return setNumberInput(e.target.value);
	};

	const submitHandler = async e => {
		e.preventDefault();

		if (!phoneNumberValidator(numberInput)) {
			ToastsStore.error('Please enter a valid phone number', 7000);
			return;
		}
		ToastsStore.warning('Loading...', 7000);
		const { data: user } = await http.post('user/', {
			number: numberInput
		});

		props.setUser(user);
		props.history.push('/message');
	};

	const phoneNumberValidator = number => {
		const isValid = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(
			number
		);
		return isValid;
	};

	return (
		<div className='form-container'>
			<span>What's your Phone Number:</span>
			<form className='login-form' noValidate onSubmit={submitHandler}>
				<TextField
					id='phone'
					label='Phone'
					value={numberInput}
					onChange={numberInputChangeHandler}
					margin='none'
				/>
				<button type='submit'>Submit</button>
			</form>
			<ToastsContainer
				store={ToastsStore}
				position={ToastsContainerPosition.TOP_RIGHT}
			/>
		</div>
	);
};

function mapStateToProps(state) {
	return { socket: state.socket };
}

const mapDispatchToProps = dispatch => {
	return {
		setUser: article => dispatch(actions.setUser(article))
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withRouter(Login));
