import React from 'react';
import readXlsxFile from 'read-excel-file'

import CanvasComponent from './Canvas';

import '../assets/css/index.css';
import SideRightComponent from './SideRight';
import LogoComponent from './Logo';
import { GetDevice} from '../data/common';
import DetailModalComponent from './ModalDetail';
import HelpModalComponent from './ModalHelp';
import LoadingComponent from './Loading';
import { adminInfo } from '../data/admin';

const gSize = {w:10, d:30}, emptyStr = JSON.stringify([]);
const device = GetDevice();

export default class MainComponent extends React.Component {
	constructor(props) {
		super(props);
		const {innerWidth, innerHeight} = window;

		this.state = {pageKey:'canvas', wSize:{width:innerWidth, height:innerHeight}, showSideLeft:true, showSideRight:device?false:true, objectStr:emptyStr, needStr:emptyStr, selObjId:null, gSize, isSump:true, showHouse:true, showGround:true, transFloor:false, pushMode:false, objListMan:emptyStr, objListOpt:emptyStr, helpTip:false, selDwcSize:emptyStr, selObjPos:emptyStr, nftDir:0, mbgbDir:0, objDir:0, systemDir:0, selVegetable:null, detailModalWrapper:false, detailModalInner:false, modelList:[], priceInitArr:[], cropList:[], fishList:[], fishFeedUnit:[], electricityUnit:0, waterUnit:0, helpModalWrapper:false, helpModalInner:false, loading:false, reset:false, photo:false, landscape:innerWidth>innerHeight};
	}

	componentDidMount = async () => {
		window.addEventListener('keydown', e=>{
			if 		(e.key === "Escape") { this.setState({pushMode:false, helpTip:false}); }
			else if (e.key === "Delete") { this.setDelObjId(this.state.selObjId); }
		})
		window.addEventListener('contextmenu', (ev) => {
			this.setState({pushMode:false, helpTip:false})
		}, false);
		// const {modelList, priceInitArr, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit} = mainInfo;
		// this.setState({priceInitArr, modelList, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit});
		const testLabel = document.getElementById('testLabel');

		if (device==='ipone') {
			const adminData = adminInfo;
			this.setState({...adminData});
		} else {
			fetch('data/admin.xlsx')
			.then(response => response.blob())
			.then(blob => readXlsxFile(blob))
			.then((rows) => {
				// testLabel.innerHTML = 'test';
				const modelList = [], priceInitArr = [], cropList = [], fishList = [], fishFeedUnit = [];
				const electricityUnit = rows[43][0], waterUnit = rows[46][0];
				for (let i = 5; i <= 10; i++) {
					const row = rows[i];
					modelList.push({key:row[0], label:row[1], unit:row[2], price:row[3], unitSize:row[4], initPrice:row[5]})
				}
				for (let i = 14; i <= 24; i++) {
					const row = rows[i];
					cropList.push({key:row[0], label:row[1],season:row[2], type:row[3], projectUnit:row[4], temprature:row[5], period:row[6]})
				}
				for (let i = 28; i <= 29; i++) {
					const row = rows[i];
					fishList.push({key:row[0], label:row[1], season:row[2], projectFeedRate:row[4]})
				}
				for (let i = 33; i <= 35; i++) {
					const row = rows[i];
					priceInitArr.push({key:row[0], label:row[1], price:row[2]})
				}
				for (let i = 39; i <= 40; i++) {
					const row = rows[i];
					fishFeedUnit.push({key:row[0], unit:row[1]})
				}
				this.setState({priceInitArr, modelList, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit});
			}, e=>console.log(e)).catch(e=>console.log(e))
		}

		window.addEventListener('resize', e=> {
			const {innerWidth, innerHeight} = window;
			this.setState({landscape:innerWidth>innerHeight, wSize:{width:innerWidth, height:innerHeight}});
			setTimeout(() => {
				this.setState({showSideRight:true})
			}, 200);
			setTimeout(() => {
				this.setState({showSideRight:false})
			}, 700);
		})
		
	}

	updateValue = (key, val) => {
		if (key==='showHouse' || key==='showGround' || key==='transFloor') {
			this.setState({[key]:val});
		}
	}

	setSelObjId = (objId) => {
		if (objId && !device) this.setState({showSideRight:true});
		this.setState({selObjId:objId});
	}

	setDelObjId = (objId) => {
		if (!objId) return;
		this.setState({delObjId:objId});
		if (objId===this.state.selObjId) this.setState({selObjId:null});
		setTimeout(() => { this.setState({delObjId:null}); }, 10);
	}

	render() {
		const {pageKey, showSideRight, selObjId, delObjId, wSize, gSize, pushMode, helpTip, isSump, selDwcSize, selObjPos, showHouse, showGround, transFloor, objectStr, needStr, nftDir, mbgbDir, objDir, systemDir, selVegetable, detailModalWrapper, detailModalInner, helpModalWrapper, helpModalInner, modelList, priceInitArr, cropList, fishList, fishFeedUnit, electricityUnit, waterUnit, loading, reset, photo, landscape} = this.state; // , showSideLeft
		return (
			<div className={`page-wrapper ${device?'mobile':''}`}>
				{/* <canvas id="design2d" width="600" height="1200" style={{position:'absolute', top:0, left:0}}></canvas> */}
				<CanvasComponent
					pageKey={pageKey}
					wSize={wSize}
					gSize={gSize}
					reset={reset}
					modelList={modelList}
					cropList={cropList}
					pushMode={pushMode}
					isSump={isSump}
					showHouse={showHouse}
					showGround={showGround}
					transFloor={transFloor}
					selObjId={selObjId}
					delObjId={delObjId}
					selDwcSize={selDwcSize}
					selObjPos={selObjPos}
					nftDir={nftDir}
					mbgbDir={mbgbDir}
					objDir={objDir}
					systemDir={systemDir}
					selVegetable={selVegetable}
					photo={photo}
					setLoading={loading=>this.setState({loading})}
					setPushMode={pushMode=>{this.setState({pushMode})}}
					setSelObjId={selObjId=>this.setSelObjId(selObjId)}
					setNeedStr={needStr=>this.setState({needStr})}
					setObjectStr={objectStr=>this.setState({objectStr})}
					setSelObjPos={selObjPos=>this.setState({selObjPos})}
					setObjDir={objDir=>this.setState({objDir})}
					setSelVegetable={selVegetable=>{this.setState({selVegetable});}}
				></CanvasComponent>
				<LogoComponent
					showSideRight={showSideRight}
				></LogoComponent>
				<SideRightComponent
					showSideRight={showSideRight}
					gSize={gSize}
					cropList={cropList}
					fishList={fishList}
					fishFeedUnit={fishFeedUnit}
					pushMode={pushMode}
					isSump={isSump}
					showHouse={showHouse}
					showGround={showGround}
					transFloor={transFloor}
					selObjId={selObjId}
					needStr={needStr}
					objectStr={objectStr}
					selObjPos={selObjPos}
					nftDir={nftDir}
					mbgbDir={mbgbDir}
					objDir={objDir}
					systemDir={systemDir}
					selVegetable={selVegetable}
					priceInitArr={priceInitArr}
					setSystemDir={systemDir=>this.setState({systemDir})}
					setShowSideRight={e=>this.setState({showSideRight:!showSideRight})}
					updateValue={(key, val)=>this.updateValue(key, val)}
					setGSize={gSize=>this.setState({gSize})}
					setPushMode={newMode=>{
						if (!this.state.pushMode && newMode) {
							this.setState({helpTip:true});
							this.setState({selObjId:null});
							// setTimeout(() => { this.setState({helpTip:null}); }, 3000);
						}
						this.setState({pushMode:newMode})
						if (device && newMode) this.setState({showSideRight:false});
					}}
					setDelObjId={this.setDelObjId}
					setSelObjId={selObjId=>this.setState({selObjId})}
					setIsSump={isSump=>{this.setState({isSump})}}
					setSelDwcSize={selDwcSize=>this.setState({selDwcSize})}
					setSelObjPos={selObjPos=>this.setState({selObjPos})}
					setModelDir={(stateKey, value)=>{this.setState({[stateKey]:value});} }
					setObjDir={objDir=>this.setState({objDir})}
					setSelVegetable={selVegetable=>{
						this.setState({selVegetable}, e=> {
							if (selVegetable) this.setState({selObjId:null});
						});
					}}
					openDetailModal={e=>this.setState({detailModalWrapper:true}, e =>{
						this.setState({detailModalInner:true});
					})}
					openHelpModal={e=>this.setState({helpModalWrapper:true}, e =>{
						this.setState({helpModalInner:true});
					})}
					resetDesign={e=>{
						this.setState({reset:true, selObjId:null, selVegetable:null, pushMode:null}, () => {
							this.setState({reset:false});
						})
						if (device) this.setState({showSideRight:false});
					}}
					takePhoto={e=>{
						this.setState({selObjId:null, photo:true}, e=>{
							this.setState({photo:false});
						})
					}}
				></SideRightComponent>
				<LoadingComponent loading={loading}></LoadingComponent>
				<DetailModalComponent
					detailModalWrapper={detailModalWrapper}
					detailModalInner={detailModalInner}
					priceInitArr={priceInitArr}
					cropList={cropList}
					fishList={fishList}
					fishFeedUnit={fishFeedUnit}
					electricityUnit={electricityUnit}
					waterUnit={waterUnit}
					isSump={isSump}
					objectStr={objectStr}
					selVegetable={selVegetable}
					closeDetailModal={e=>{
						this.setState({detailModalInner:false});
						setTimeout(() => {
							this.setState({detailModalWrapper:false});
						}, 500);
					}}
				></DetailModalComponent>
				<HelpModalComponent
					helpModalWrapper={helpModalWrapper}
					helpModalInner={helpModalInner}
					closeHelpModal={e=>{
						this.setState({helpModalInner:false});
						setTimeout(() => {
							this.setState({helpModalWrapper:false});
						}, 500);
					}}
				></HelpModalComponent>
				{!device &&
					<div className={`help-tip flex ${helpTip?'show':''}`}>
						<div className='help-label'>To cancel add element, press Escape key or mouse right click.</div>
					</div>
				}
				{device &&
					<div className={`help-tip flex ${helpTip?'show':''}`}
						onClick={e=>{
							this.setState({pushMode:false, helpTip:false});

						}}>
						<div className='help-label'>Cancel element</div>
					</div>
				}
				{device && landscape &&
					<div className='size-alert flex'>
						Please rotate to portrait mode
					</div>
				}
			</div>
		);
	}
}
