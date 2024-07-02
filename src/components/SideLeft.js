import React from 'react';
import imgSideArrow from '../assets/images/side-arrow.png';

// import '../assets/css/index.css';

export default class SideLeftComponent extends React.Component {
	constructor(props) {
		super(props);
		const {showSideLeft, gSize} = props;
		this.state = {showSideLeft, gSize, selMenu:''};
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		['showSideLeft', 'gSize'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				this.setState({[stateKey]:nextProps[stateKey]});
			}
		});
	}

	setGSize = (e, key) => {
		const val = parseInt(e.target.value), {gSize} = this.state;
		this.props.setGSize({...gSize, [key]:val});
	}

	addElement = (modelKey) => {
		this.props.setPushMode(modelKey);
	}

	setSelMenu = (menuKey) => {
		this.props.setPushMode(null);
		const selMenu = menuKey===this.state.selMenu?'':menuKey;
		this.setState({selMenu});
	}

	render() {
		const {showSideLeft, gSize, selMenu} = this.state;
		return (
			<div className={`side-bar side-left ${showSideLeft?'show':''}`}>
				<div className='side-show-wrapper'>
					<div className='side-show-inner flex' onClick={e=>this.props.setShowSideLeft()}>
						<img className='' src={imgSideArrow}></img>
					</div>
				</div>
				<div className='logo-title flex'>Aquaponics</div>

				<div className={`main-item ${selMenu==='buildingSize'?'open':''} main-building-size`}>
					<div className='title-row' onClick={e=>this.setSelMenu('buildingSize')}>
						<label>Building Size</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-item input-item'>
							<label>Width</label>
							<input type='range' min={4} max={20} value={gSize.w} onChange={e=>this.setGSize(e, 'w')}></input>
							<label className='unit-label'>{gSize.w} m</label>
						</div>
						<div className='sub-item input-item'>
							<label>Length</label>
							<input type='range' min={25} max={50} value={gSize.d} onChange={e=>this.setGSize(e, 'd')}></input>
							<label className='unit-label'>{gSize.d} m</label>
						</div>
					</div>
				</div>

				<div className={`main-item ${selMenu==='addElement'?'open':''} main-add-element`}>
					<div className='title-row' onClick={e=>this.setSelMenu('addElement')}>
						<label>Add Element</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
					</div>
				</div>

				<div className={`main-item ${selMenu==='priceTable'?'open':''} main-price-table`}>
					<div className='title-row' onClick={e=>this.setSelMenu('priceTable')}>
						<label>Price Table</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='price-table'>
							<div className='price-row price-header'>
								<div className='price-field field-object'>Object</div>
								<div className='price-field field-unit'>Unit</div>
								<div className='price-field field-price'>Price</div>
								<div className='price-field field-amount'>Count</div>
								<div className='price-field field-total'>Total</div>
							</div>
						</div>
						<div className='total-price'>
							<label>Total Price : $5000</label>
						</div>
					</div>
				</div>

			</div>
		);
	}
}
