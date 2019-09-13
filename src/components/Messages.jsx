import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import { ReactComponent as SendIcon } from '../assets/send-icon.svg';
import http from '../http';
import cloneDeep from 'clone-deep';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
	ToastsContainer,
	ToastsStore,
	ToastsContainerPosition
} from 'react-toasts';

import './messages.scss';

const Messages = props => {
	const [messageInput, setMessageInput] = useState('');
	const [messages, setMessages] = useState([]);
	const [showLoaderMsg, setShowLoaderMsg] = useState(false);
	const messageTextFieldRef = useRef(null);

	const scrollToRef = ref => window.scrollTo(0, ref.current.offsetTop);
	const executeScroll = () => scrollToRef(messageTextFieldRef);

	useEffect(() => {
		// If user hasn't been set, that means user didn't enter
		// their number in the home page, and there is therefore
		// no way of knowing who the user is. So we will redirect
		// to the home page so that they can put in their number
		if (!props.user) return props.history.push('/');

		/**
		 * Retrieves all the sms messages from based on the users ID
		 * @param {String} id This is the users auto generated unique ID
		 */
		const getMessages = async id => {
			try {
				const { data } = await http.get(`sms/${id}`);
				// Sets the messages state
				setMessages(data);
			} catch (error) {
				ToastsStore.error(
					'Oops! Something went wrong, which prevented us from sending over your text messages.',
					7000
				);
				return;
			}
		};

		// Get all the sms from a particular user
		getMessages(props.user._id);

		// This will send over the users number so that sockets server can join
		props.socket.on('connected', () => {
			props.socket.emit('join', { number: props.user.number });
		});
	}, []);

	useEffect(() => {
		if (!props.socket) return;

		// This will send over the users number so that sockets server can join
		props.socket.emit('join', { number: props.user.number });
	}, [props.socket]);

	useEffect(() => {
		if (!props.socket) return;

		executeScroll();
		function messageToClientHandler(data) {
			addMessageToDB(data);
			setShowLoaderMsg(false);
		}

		props.socket.on('messageToClient', messageToClientHandler);
		return () => {
			// Need to turn off the event listener when component will unmount.
			// If  not, each re-render, you are calling socket.on, resulting in
			// multiple 'messageToClient' event listeners
			// Read this answer for more detials: https://stackoverflow.com/a/54830805/4861207
			props.socket.off('messageToClient', messageToClientHandler);
		};
	}, [messages]);

	/**
	 * Sets the messages state to update the client side of the chat,
	 * and emits a 'messageToServer' socket event
	 * @param {Object} data Requires the following values: message, didUserSend, autoResponseQueue
	 */
	function addMessageToDB(data) {
		const currentMessage = {
			...data,
			dateAdded: new Date()
		};

		const oldMessages = cloneDeep(messages);
		// Add the new incoming message to the message state
		setMessages([...oldMessages, currentMessage]);

		// Emit 'messageToServer' to socket event
		props.socket.emit('messageToServer', currentMessage);
	}

	// Gives the textfield a single source of truth
	const messageInputChangeHandler = e => {
		setMessageInput(e.target.value);
	};

	/**
	 * This is the submit function when a user submits a message
	 * This configures the data to an object which then gets
	 * passed to addMessageToDB
	 * @param {Object} e Event Object
	 */
	const messageSubmitHandler = async e => {
		e.preventDefault();

		// If the user didn't type anything in the message textfield,
		// then don't proceed
		if (!messageInput.length) return;

		setShowLoaderMsg(true);

		const messageData = {
			userId: props.user._id,
			message: messageInput,
			didUserSend: true,
			autoResponseQueue: false
		};

		addMessageToDB(messageData);

		// Empty the message textfield
		setMessageInput('');
	};

	return (
		<div className='messages-container'>
			<div className='messages'>
				{messages &&
					messages.map((currentMeesage, index) => (
						<SingleMessage
							key={`${currentMeesage.dateAdded}${index}`}
							message={currentMeesage.message}
							didUserSend={currentMeesage.didUserSend}
						/>
					))}
				{showLoaderMsg && <SingleMessage />}
			</div>

			<form
				className='chat-form'
				noValidate
				autoComplete='off'
				onSubmit={messageSubmitHandler}
			>
				<TextField
					id='message'
					label='Message'
					value={messageInput}
					onChange={messageInputChangeHandler}
					margin='none'
					className='message-input'
					ref={messageTextFieldRef}
					autoFocus
				/>
				<button type='submit'>
					<SendIcon />
				</button>
			</form>
			<ToastsContainer
				store={ToastsStore}
				position={ToastsContainerPosition.TOP_RIGHT}
			/>
		</div>
	);
};

const SingleMessage = props => {
	let className = 'single-message';
	if (props.didUserSend) className += ' right';

	if (!props.message) {
		return (
			<div className='single-message msg-loader'>
				<span></span>
				<span></span>
				<span></span>
			</div>
		);
	}
	return <div className={className}>{props.message}</div>;
};

function mapStateToProps(state) {
	return {
		socket: state.socket,
		user: state.user
	};
}

export default connect(mapStateToProps)(withRouter(Messages));
