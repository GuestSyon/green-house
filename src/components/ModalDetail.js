import React from 'react';
import {ReactComponent as SvgClose} from '../assets/images/close.svg';
import { GetRoundNum, GetTotalValue } from '../data/common';

export default class DetailModalComponent extends React.Component {
	constructor(props) {
		super(props);
		const {detailModalWrapper, detailModalInner, isSump, objectStr, selVegetable, priceInitArr, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit} = props;
		this.objectArr = []; this.selVegetable = {}; this.selFish = {}; this.cropArea = 0;
		this.state = {detailModalWrapper, detailModalInner, isSump, objectStr, selVegetable, priceInitArr, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit};
	}

	componendividMount() {
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		['detailModalWrapper', 'detailModalInner', 'isSump', 'objectStr', 'selVegetable', 'priceInitArr', 'cropList', 'fishList', 'fishFeedUnit', 'electricityUnit', 'waterUnit'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				const {cropList, objectStr, fishList} = this.state;
				if (stateKey==='selVegetable') {
					this.selVegetable = cropList.find(item=>{return item.key===nextProps.selVegetable}) || {};
					this.selFish = fishList.find(item=>{return item.season===this.selVegetable.season}) || {};
				} else if (stateKey==='objectStr') {
					this.objectArr = JSON.parse(nextProps.objectStr);
					var cropArea = 0;
					this.objectArr.forEach(object => { cropArea += object.size || 0; });
					this.cropArea = cropArea;
				}
				this.setState({[stateKey]:nextProps[stateKey]}, e=> {
				});
			}
		});
	}

	getFishFeed = () => {
		const {fishFeedUnit} = this.state, {type, period} = this.selVegetable;
		const selFishFeedUnit = fishFeedUnit.find(item=>{return item.key===type}) || {};
		return selFishFeedUnit.unit * this.cropArea * period / 1000;
	}

	getFishYield = () => {

	}

	render() {
		const {detailModalWrapper, detailModalInner, priceInitArr, electricityUnit, waterUnit} = this.state;
		return (
			<div className={`detail-modal modal-back ${detailModalWrapper?'active':''}`}>
				<div className={`modal-wrapper ${detailModalInner?'active':''}`}>
					<div className='detail-title modal-title'>Detail Info</div>
					<div className='modal-content scroll scroll-y'>
						<div className='content-side'>
							<div className='info-item'>
								<div className='info-title'>Cost</div>
								<div className='info-content'>
									<div className='sub-item'>
										<div className='sub-label'>Initiation Cost</div>
										<div className='sub-value'>${GetTotalValue(priceInitArr)}</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Building Cost</div>
										<div className='sub-value'>${GetTotalValue(this.objectArr)}</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Total Cost</div>
										<div className='sub-value'>${GetTotalValue([...priceInitArr, ...this.objectArr])}</div>
									</div>
								</div>
							</div>
							<div className='info-item'>
								<div className='info-title'>Condition</div>
								<div className='info-content'>
									<div className='sub-item'>
										<div className='sub-label'>Selected Vegetable</div>
										<div className='sub-value'>{this.selVegetable.label}</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Selected Fish</div>
										<div className='sub-value'>{this.selFish.label}</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Crop Season</div>
										<div className='sub-value capital'>{this.selVegetable.season}</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Temprature Range</div>
										<div className='sub-value'>{this.selVegetable.temprature} °C</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Vegetable Period</div>
										<div className='sub-value'>{this.selVegetable.period} days</div>
									</div>
								</div>
							</div>
						</div>
						<div className='content-side'>
							<div className='info-item'>
								<div className='info-title'>Consumption</div>
								<div className='info-content'>
									<div className='sub-item'>
										<div className='sub-label'>Amount of Fish Feed</div>
										<div className='sub-value'>{this.getFishFeed() || 0} Kg</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Electricity Consumption</div>
										<div className='sub-value'>{GetRoundNum(electricityUnit * this.selVegetable.period * this.cropArea, 3) || 0} kWh</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Water Consumption</div>
										<div className='sub-value'>{GetRoundNum(waterUnit * this.selVegetable.period * this.cropArea, 3) || 0} L</div>
									</div>
								</div>
							</div>
							<div className='info-item'>
								<div className='info-title'>Projected Yield</div>
								<div className='info-content'>
									<div className='sub-item'>
										<div className='sub-label'>Crop Yield (Vegetable)</div>
										<div className='sub-value'>{GetRoundNum(this.cropArea * this.selVegetable.projectUnit, 3) || 0} Kg</div>
									</div>
									<div className='sub-item'>
										<div className='sub-label'>Fish Yield (Charp)</div>
										<div className='sub-value'>{this.selFish.projectFeedRate * this.getFishFeed() || 0} Kg</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='close-icon flex' onClick={()=>this.props.closeDetailModal()}><SvgClose></SvgClose></div>
				</div>
			</div>
		);
	}
}
