import React from 'react';
import { GetDevice, GetManModels, GetRoundNum, GetTotalValue } from '../data/common';
import imgSideArrow from '../assets/images/arrow-new.png';
import imgIconPos from '../assets/images/location.png';
import imgIconSize from '../assets/images/object-size.png';
import imgIconDel from '../assets/images/object-del.png';
import imgReset from '../assets/images/reset.png';
import imgCamera from '../assets/images/camera.png';
import '../assets/css/index.css';

const testMode = false, device = GetDevice();

export default class SideRightComponent extends React.Component {
	constructor(props) {
		super(props);
		const {showSideRight, gSize, isSump, showHouse, showGround, transFloor, objectStr, needStr, selObjId, selObjPos, objDir, systemDir, nftDir, mbgbDir, selVegetable, priceInitArr, cropList, fishList} = props;
		this.objectArr = []; this.needArr = []; this.selObject = {};
		this.state = {showSideRight, gSize, isSump, selMenu:'', showHouse, showGround, transFloor, objectStr, needStr, selObjId, selObjPos, objDir, systemDir, dwcX:1, dwcZ:1, nftDir, mbgbDir, selVegetable, cropList, fishList, priceInitArr}; // chooseVegetable priceTable
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		['showSideRight', 'gSize', 'isSump', 'showHouse', 'showGround', 'transFloor', 'objectStr', 'needStr', 'selObjId', 'selObjPos', 'objDir', 'systemDir', 'nftDir', 'mbgbDir', 'selVegetable', 'priceInitArr', 'cropList', 'fishList'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				if 		(stateKey==='needStr') this.needArr = JSON.parse(nextProps.needStr);
				else if (stateKey==='objectStr') {
					this.objectArr = JSON.parse(nextProps.objectStr);
					if (this.state.selObjId) {
						this.selObject = this.objectArr.find(object=>{return object.objId===this.state.selObjId}) || {};
					}
				}
				else if (stateKey==='selObjPos') this.setInputObjPos(nextProps.selObjPos);
				else if (stateKey==='selObjId') {
					this.selObject = this.objectArr.find(object=>{return object.objId===nextProps.selObjId}) || {};
					if (this.selObject.objKey) {
						const {scale, posX, posZ} = this.selObject;
						this.setState({selMenu:'selObject', posX, posZ});
						if (scale) {
							this.setState({dwcX:scale.x, dwcZ:scale.z});
						}
					} else if (!this.state.selVegetable) {
						this.setState({selMenu:'priceTable'}); // objectList
					}
				}
				this.setState({[stateKey]:nextProps[stateKey]}); // 2024/2019
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

	updateValue = (key, value) => {
		this.props.updateValue(key, value);
	}

	setSelMenu = (menuKey) => {
		this.props.setPushMode(null);
		const disableArr = ['importSump', 'buildingSize', 'addElement']
		if (this.state.selVegetable && disableArr.includes(menuKey)) {
			window.alert('You already selected a vegetable, so can not edit the item');
			return;
		}
		const selMenu = menuKey===this.state.selMenu?'':menuKey;
		this.setState({selMenu});
	}

	setDwcSize = (e, axis) => {
		const val = GetRoundNum(parseFloat(e.target.value)), stateKey = axis==='x'?'dwcX':'dwcZ';
		this.setState({[stateKey]:val});
		const {dwcX, dwcZ} = this.state, dwcSize = {x:dwcX, z:dwcZ};
		dwcSize[axis] = val;
		this.props.setSelDwcSize(JSON.stringify(dwcSize));
	}

	setObjectPos = (e, axis) => {
		const val = GetRoundNum(parseFloat(e.target.value));
		const {posX, posZ} = this.state, objPos = {x:posX, z:posZ};
		objPos[axis] = val;
		this.props.setSelObjPos(JSON.stringify(objPos));
	}

	setInputObjPos = (posStr) => {
		if (!posStr) return;
		const objPos = JSON.parse(posStr);
		if (!objPos) return;
		this.setState({posX:objPos.x, posZ:objPos.z});
	}

	getRadioVal = (modelKey, radioDir) => {
		const stateKey = modelKey+'Dir';
		return this.state[stateKey] === radioDir;
	}

	setModelDir = (value, modelKey) => {
		const stateKey = modelKey+'Dir';
		this.props.setModelDir(stateKey, value);
	}

	setObjectDir = (value) => {
		this.props.setObjDir(value);
	}

	setIsSump = (value) => {
		if (this.state.isSump===value) return;
		if (window.confirm('Do you want to ignore current design and change smap-tank configuraton?')) {
			this.props.setIsSump(value);
		}
	}

	setSystemDir = (value) => {
		if (this.state.systemDir===value) return;
		this.props.setSystemDir(value);
	}

	deleteObject = (key) => {
		var selObjId;
		for (let i = this.objectArr.length - 1; i >= 0; i--) {
			if (selObjId) continue;
			if (this.objectArr[i].objKey===key) selObjId = this.objectArr[i].objId;
		}
		if (selObjId) this.props.setDelObjId(selObjId);
	}

	setVegetable = (item) => {
		if (GetManModels(this.needArr, 'man').length > 0) {
			window.alert('Please import mandatory objects, before choose vegetable');
			this.setState({selMenu:'addElement'})
			return;
		}
		if (this.state.selVegetable) {
			this.props.setSelVegetable(item.key);
			this.setState({selSeason:item.season});
		} else if (window.confirm('After select vegetable, you can not change object properties')) {
			this.props.setSelVegetable(item.key);
			this.setState({selSeason:item.season});
		}
	}

	render() {
		const {showSideRight, gSize, isSump, selMenu, selObjId, objDir, systemDir, showHouse, showGround, transFloor, posX, posZ, dwcX, dwcZ, nftDir, mbgbDir, selVegetable, selSeason, priceInitArr, cropList, fishList} = this.state;
		return (
			<div className={`side-bar side-right ${showSideRight?'show scroll scroll-y':''}`}>
				<div className='side-show-wrapper'>
					<div className='side-show-inner flex' onClick={e=>this.props.setShowSideRight()}>
						<img className='' src={imgSideArrow}></img>
					</div>
				</div>
				<div className='logo-title flex'>
					<div className='left-wrapper'></div>
					<div className='icon-wrapper camera-wrapper' onClick={e=>{ this.props.takePhoto(); }}>
						<img src={imgCamera}></img>
					</div>
					<div className='icon-wrapper reset-wrapper' onClick={e=>{
						if (window.confirm('Do you want to reset all design?')) {
							this.props.resetDesign();
						}
					}}>
						<img src={imgReset}></img>
					</div>
					<div className='icon-wrapper help-wrapper' onClick={e=>this.props.openHelpModal()}>
						<label>?</label>
					</div>
				</div>

				<div className={`main-item ${selMenu==='importSump'?'open':''} ${selVegetable?'disable':''} main-import-sump`}>
					<div className='title-row' onClick={e=>this.setSelMenu('importSump')}>
						<label>Import Sump tank</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-item'>
							{[{value:true, label:'Yes'}, {value:false, label:'No'}].map((item, idx)=>
								<div className={`radio-wrapper ${isSump===item.value?'active':''}`} onClick={e=>this.setIsSump(item.value)} key={idx}>
									<input type="radio" value={item.value} checked={isSump===item.value} onChange={e=>{}}></input>
									<div className={``}>{item.label}</div>
								</div>
							)}
						</div>
						<div className={`sub-item ${isSump?'':'hide'}`}>
							{[{value:0, str:'ver'}, {value:1, str:'hor'}].map((item, idx)=>
								<div className={`radio-wrapper ${systemDir===item.value?'active':''}`} onClick={e=>this.setSystemDir(item.value)} key={idx}>
									<input type="radio" value={item.value} checked={systemDir===item.value} onChange={e=>{}}></input>
									<div className={`model-dir dir-${item.str}`}></div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className={`main-item ${selMenu==='buildingSize'?'open':''} ${selVegetable?'disable':''} main-building-size`}>
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

				<div className={`main-item ${selMenu==='addElement'?'open':''} ${selVegetable?'disable':''} main-add-element`}>
					<div className='title-row' onClick={e=>this.setSelMenu('addElement')}>
						<label>Add Element</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						{GetManModels(this.needArr, 'man').length > 0 &&
							<div className='sub-title'>Mandatory Object</div>
						}
						{GetManModels(this.needArr, 'man').map((model, idx)=>
							<div className='sub-item' key={idx}>
								<div className='model-button' onClick={e=>{
									if (selMenu!=='addElement') return;
									this.addElement(model.key)
								}}>
									<label>{model.label}</label>
									<img src={'./object-icon/'+model.key+'.jpg'}></img>
								</div>
								<label className='add-count'>{model.addCount}</label>
							</div>
						)}
						{GetManModels(this.needArr, 'man').length===0 &&
							<div className='empty-row'></div>
						}
						<div className='sub-title'>Optional Object</div>
						{GetManModels(this.needArr, 'opt', isSump).map((model, idx)=>
							<div className='sub-item' key={idx}>
								<div className='model-button' onClick={e=>{
									if (selMenu!=='addElement') return;
									this.addElement(model.key)
								}}>
									<label>{model.label}</label>
									<img src={'./object-icon/'+model.key+'.jpg'}></img>
								</div>
								{(model.key==='nft' || model.key==='mbgb') && !isSump &&
									[{value:0, str:'ver', first:true}, {value:1, str:'hor'}].map((item, idx)=>
										<div className={`radio-wrapper ${this.state[model.key+'Dir']===item.value?'active':''} ${item.first?'first':''}`} onClick={e=>this.setModelDir(item.value, model.key)} key={idx}>
											<input type="radio" value={item.value} checked={this.getRadioVal(model.key, item.value)} onChange={e=>{}}></input>
											<div className={`model-dir dir-${item.str}`}></div>
										</div>
									)
								}
							</div>
						)}
					</div>
				</div>

				<div className={`main-item ${selMenu==='priceTable'?'open':''} main-price-table`}>
					<div className='title-row' onClick={e=>this.setSelMenu('priceTable')}>
						<label>Price Table</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-title'>Initial Cost</div>
						<div className='price-table'>
							<div className='price-row price-header'>
								<div className='price-field field-initType'>Type</div>
								<div className='price-field field-initPrice field-num'>Price ($)</div>
							</div>
							{priceInitArr.map((model, idx)=>
								<div className='price-row' key={idx}>
									<div className='price-field field-initType'>{model.label}</div>
									<div className='price-field field-initPrice field-num'>{model.price}</div>
								</div>
							)}
							<div className='price-row price-total-row'>
								<div className='price-field field-initType'>Total</div>
								<div className='price-field field-initPrice field-num'>{GetTotalValue(priceInitArr)}</div>
							</div>
						</div>
						<div className='empty-row'></div>
						<div className='sub-title'>Building Cost</div>
						<div className='price-table'>
							<div className='price-row price-header'>
								<div className='price-field field-object'>Object</div>
								<div className='price-field field-count'>Count</div>
								<div className='price-field field-size'>Size (㎡)</div>
								<div className='price-field field-amount'>Volume (㎥)</div>{/* &#13221; */}
								<div className='price-field field-total'>Price ($)</div>
								<div className='price-field field-delete'></div>
							</div>
							{this.needArr.map((model, idx)=>
								<div className='price-row' key={idx}>
									<div className='price-field field-object'>{model.label}</div>
									<div className='price-field field-count'>{model.count}</div>
									<div className='price-field field-size field-num'>{model.size || 'N/A'}</div>
									<div className='price-field field-amount field-num'>{model.volume || 'N/A'}</div>
									<div className='price-field field-total field-num'>{model.price}</div>
									<div className={`price-field field-delete ${idx > 0 && model.count > 0?'active':''}`}
										onClick={e=>{
											if (selVegetable) return;
											if (idx > 0 && model.count > 0) this.deleteObject(model.key);
										} }
									>
										{!selVegetable && idx > 0 && model.count > 0 && <img src={imgIconDel}></img>}
									</div>
								</div>
							)}
							<div className='price-row price-total-row'>
								<div className='price-field field-object'>Total</div>
								<div className='price-field field-count'>{GetTotalValue(this.needArr, 'count')}</div>
								<div className='price-field field-size field-num'>{GetTotalValue(this.needArr, 'size')}</div>
								<div className='price-field field-amount field-num'>{GetTotalValue(this.needArr, 'volume')}</div>
								<div className='price-field field-total field-num'>{GetTotalValue(this.needArr)}</div>
								<div className={`price-field field-delete`}></div>
							</div>
						</div>
						<div className='total-price-wrapper flex'>
							<div className='label'>Total Price</div>
							<div className='value'>$ {GetTotalValue([...this.needArr, ...priceInitArr]) }</div>
						</div>
					</div>
				</div>

				{testMode && <div className={`main-item ${selMenu==='objectList'?'open':''} main-objectList`}>
					<div className='title-row' onClick={e=>this.setSelMenu('objectList')}>
						<label>Element List</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='object-list-wrapper scroll scroll-y'>
							<div className='object-list-inner' style={{height:`${(this.objectArr.length+1)*31+5}px`}}>
								<div className='object-row object-list-header'>
									<div className='cell-no'>no</div>
									<div className='cell-name'>Name</div>
									<div className='cell-pos'><img src={imgIconPos}></img> (x, y)</div>
									<div className='cell-rot'><img src={imgIconSize}></img></div>
									<div className='cell-del'></div>
								</div>
								
								{this.objectArr.map((object, idx)=>
									<div className={`object-row ${selObjId===object.objId?'active':''}`} key={idx}>
										<div className='cell-no' onClick={e=>this.props.setSelObjId(object.objId)}>{idx+1}</div>
										<div className='cell-name' onClick={e=>this.props.setSelObjId(object.objId)}>{object.label}</div>
										<div className='cell-pos' onClick={e=>this.props.setSelObjId(object.objId)}>
											<label>{GetRoundNum(object.posX)}</label>
											<label>{GetRoundNum(object.posZ)}</label></div>
										<div className='cell-rot' onClick={e=>this.props.setSelObjId(object.objId)}>{object.size || ''}</div>
										<div className='cell-del' onClick={e=>this.props.setDelObjId(object.objId)}><img src={imgIconDel}></img></div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>}

				<div className={`main-item ${selMenu==='selObject'?'open':''} main-selObject`}>
					<div className='title-row' onClick={e=>this.setSelMenu('selObject')}>
						<label>Selected Object</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-item input-item'>
							<label className='info-label'>Object</label>
							<span className='info-value'> : {this.selObject.label}</span>
						</div>
						<div className='sub-item input-item'>
							<label className='info-label'>{this.selObject.size?'Size':'Volume'}</label>
							<span className='info-value'> : {this.selObject.size || this.selObject.volume} {this.selObject.size?'㎡':'㎥'} </span>
						</div>
						<div className='sub-item input-item'>
							<label className='info-label'>Price</label>
							<span className='info-value'> : {GetRoundNum(this.selObject.price, 3)} $</span>
						</div>

						{/* <div className='sub-item input-item'>
							<label>Pos X</label>
							<input type='range' min={gSize.w/-2} max={gSize.w/2} step={0.1} value={posX || 0} onChange={e=>this.setObjectPos(e, 'x')}></input>
							<label className='unit-label'>{posX} m</label>
						</div>
						<div className='sub-item input-item'>
							<label>Pos Y</label>
							<input type='range' min={gSize.d/-2} max={gSize.d/2} step={0.1} value={posZ || 0} onChange={e=>this.setObjectPos(e, 'z')}></input>
							<label className='unit-label'>{posZ} m</label>
						</div> */}

						{this.selObject.objKey==='dwc' &&
							<>
								<div className='sub-item input-item'>
									<label>Width</label>
									<input type='range' min={1} max={gSize.w - 1} step={0.1} value={dwcX || 1} onChange={e=>this.setDwcSize(e, 'x')}></input>
									<label className='unit-label'>{dwcX} m</label>
								</div>
								<div className='sub-item input-item'>
									<label>Length</label>
									<input type='range' min={4.5} max={gSize.d - 1} step={0.1} value={dwcZ || 1} onChange={e=>this.setDwcSize(e, 'z')}></input>
									<label className='unit-label'>{dwcZ} m</label>
								</div>
							</>
						}
						{(this.selObject.objKey==='nft' || this.selObject.objKey==='mbgb') && !isSump && //  || this.selObject.objKey==='sump'
							<div className={`sub-item input-item sub-input-rotate-${this.selObject.objKey}`}>
								<label>Direction</label>
								{ [{value:0, str:'ver', first:true}, {value:1, str:'hor'}].map((item, idx)=>
									<div className={`radio-wrapper ${objDir===item.value?'active':''} ${item.first?'first':''}`} onClick={e=>this.setObjectDir(item.value)} key={idx}>
										<input type="radio" value={item.value} checked={objDir===item.value} onChange={e=>{}}></input>
										<div className={`model-dir dir-${item.str} dir-${item.str}-${item.value}`}></div>
									</div>
								) }
								{/* {this.selObject.objKey==='sump' && [{value:2, str:'ver'}, {value:3, str:'hor'}].map((item, idx)=>
									<div className={`radio-wrapper ${objDir===item.value?'active':''}`} onClick={e=>this.setObjectDir(item.value)} key={idx}>
										<input type="radio" value={item.value} checked={objDir===item.value} onChange={e=>{}}></input>
										<div className={`model-dir dir-${item.str} dir-${item.str}-${item.value}`}></div>
									</div>
								)} */}
							</div>
						}
						{this.selObject.objId && this.selObject.objKey !== 'sump' &&
							<div className='object-delete flex' onClick={e=>this.props.setDelObjId(this.selObject.objId)}>
								<img src={imgIconDel}></img>
							</div>
						}
					</div>
				</div>

				<div className={`main-item ${selMenu==='chooseVegetable'?'open':''} main-chooseVegetable`}>
					<div className='title-row' onClick={e=>this.setSelMenu('chooseVegetable')}>
						<label>Choose Vegetable</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-title'>Summer Crops</div>
						<div className='crop-wrapper'>
							{cropList.filter(item=>{return item.season==='summer'}).map((item, idx)=>
								<div className={`crop-button button ${selVegetable===item.key?'active':''} flex`} key={idx} onClick={e=>{this.setVegetable(item)}}>
									<div>{item.label}</div>
									<img src={'./btnIcon/'+item.key+'.jpg'}></img>
								</div>
							)}
						</div>
						<div className='sub-interval'></div>
						<div className='sub-title'>Winter Crops</div>
						<div className='crop-wrapper'>
							{cropList.filter(item=>{return item.season==='winter'}).map((item, idx)=>
								<div className={`crop-button button ${selVegetable===item.key?'active':''} flex`} key={idx} onClick={e=>{this.setVegetable(item)}}>
									<div>{item.label}</div>
									<img src={'./btnIcon/'+item.key+'.jpg'}></img>
								</div>
							)}
						</div>
						<div className='sub-internal'></div>
						<div className='sub-title'>Suitable fish species</div>
						<div className='fish-wrapper flex'>
							{fishList.map((item, idx)=>
								<div className={`fish-item ${item.season===selSeason?'active':''} flex`} key={idx}>
									<div>{item.label}</div>
									<img src={'./btnIcon/'+item.key+'.jpg'}></img>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className={`main-item ${selMenu==='environment'?'open':''} main-environment`}>
					<div className='title-row' onClick={e=>this.setSelMenu('environment')}>
						<label>Environment</label>
						<img src={imgSideArrow}></img>
					</div>
					<div className='sub-wrapper'>
						<div className='sub-item check-item'>
							<input type='checkbox' checked={showHouse} onChange={e=>this.updateValue('showHouse', !showHouse)}></input>
							<label>Show building</label>
						</div>
						<div className='sub-item check-item'>
							<input type='checkbox' checked={showGround} onChange={e=>this.updateValue('showGround', !showGround)}></input>
							<label>Show ground</label>
						</div>
						<div className='sub-item check-item'>
							<input type='checkbox' checked={transFloor} onChange={e=>this.updateValue('transFloor', !transFloor)}></input>
							<label>Transparent floor</label>
						</div>
					</div>
				</div>

				<div className='side-footer'>
					{GetManModels(this.needArr, 'man').length==0 && selVegetable &&
						<div className='button' onClick={e=>this.props.openDetailModal()}>Detail info</div>
					}
				</div>

			</div>
		);
	}
}
