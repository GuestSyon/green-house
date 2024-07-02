import React from 'react';

import imgLogo from '../assets/images/logo.jpg';
import '../assets/css/index.css';
import { GetDevice } from '../data/common';

const device = GetDevice();

export default class LogoComponent extends React.Component {
	constructor(props) {
		super(props);
		const {showSideRight} = window;
		this.state = {showSideRight};
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		['showSideRight'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				this.setState({[stateKey]:nextProps[stateKey]});
			}
		});
	}

	render() {
		const {showSideRight} = this.state;
		return (
			<div className={`logo-wrapper flex-column ${showSideRight && device?'hide':''}`}>
				<img className='' src={imgLogo}></img>
				{/* <div className='logo-image flex' id='testLabel'>Logo Area</div>
				<div className='logo-title flex'>Logo Title</div> */}
			</div>
		);
	}
}
