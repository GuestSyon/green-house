import React from 'react';
import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// import imgFloor from '../assets/images/floor0.jpg';
import { GetDevice, GetFloorPos, GetRaycaster, GetRoundNum, planeSize } from '../data/common';
import { CreateDWCModel, DelObject, GetReadyModel, LoadHouse, LoadPlane, LoadPlantMapArr, LoadSubModel, SetFrameMeshArr, SetHouseSize } from '../data/loader';
import { SetShowGround, SetShowHouse, SetTransFloor } from '../data/environment';
import { SetModelPosInfo, ControlSumptank, SetDwcSize, SetModelDir } from '../assets/controls/ModelControl';

const camDis = 25, device = GetDevice();
// const envMap = new THREE.CubeTextureLoader().load(imgEnv0Arr);

export default class CanvasComponent extends React.Component {
	constructor(props) {
		super(props);
		const {pageKey, wSize, gSize, modelList, cropList, pushMode, selObjId, delObjId, isSump, selDwcSize, selObjPos, showHouse, showGround, transFloor, objDir, systemDir, nftDir, mbgbDir, selVegetable, reset, photo} = props;
		this.state = {pageKey, wSize, gSize, modelList, cropList, pushMode, selObjId, delObjId, isSump, selDwcSize, selObjPos, showHouse, showGround, transFloor, objDir, systemDir, nftDir, mbgbDir, selVegetable, reset, photo};
		this.frameMeshArr = [];
		this.planePosDown = undefined; this.mousePosDown = null;
		this.sumpPos = {x:0, z:5}; this.sumpD = 0.8;
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
	}

	componentDidMount() {
		this.initScene();
		this.animate();
		this.loadModel();
		window.addEventListener('pointerdown', e=>this.onMouseDown(e));
		window.addEventListener('pointermove', e=>this.onMouseMove(e));
		window.addEventListener('pointerup', e=>this.onMouseUp(e));
	}

	componentWillReceiveProps(nextProps) {
		['pageKey', 'wSize', 'modelList', 'cropList', 'gSize', 'pushMode', 'isSump', 'selObjId', 'delObjId', 'selDwcSize', 'selObjPos', 'showHouse', 'showGround', 'transFloor', 'objDir', 'systemDir', 'nftDir', 'mbgbDir', 'selVegetable', 'reset', 'photo'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				this.setState({[stateKey]:nextProps[stateKey]}, () => {
					const readyModel = GetReadyModel(this.objectGroup)
					const {isSump, gSize, showHouse, showGround, transFloor, cropList, selObjId, delObjId, nftDir, mbgbDir, objDir, reset, photo} = this.state;
					if 		(stateKey==='pushMode') this.setPushMode();
					else if (stateKey==='cropList') {LoadPlantMapArr(this, cropList);}
					else if	(stateKey==='gSize') {SetHouseSize(this, gSize, true);} // this.emptyObjGroup();
					else if (stateKey==='systemDir') this.emptyObjGroup();
					else if (stateKey==='isSump') { this.controlSumptank(); this.emptyObjGroup(); } //   this.updateObjectArr();
					else if	(stateKey==='showHouse') SetShowHouse(this.houseGroup, showHouse);
					else if (stateKey==='showGround') SetShowGround(this, showGround);
					else if (stateKey==='transFloor') SetTransFloor(this.planeMesh, this.houseGroup, this.mapConcrete, transFloor);
					else if (stateKey==='selObjId') SetFrameMeshArr(this.frameMeshArr, selObjId);
					else if (stateKey==='delObjId') {DelObject(this, delObjId); this.updateObjectArr();}
					else if (stateKey==='selDwcSize') {this.setDwcSize();}
					else if (stateKey==='selObjPos') {this.setObjPos();}
					else if (stateKey==='objDir') {SetModelDir(this.selObject, objDir); SetModelPosInfo(isSump, this.selObject, gSize, this.objectGroup);}
					else if (stateKey==='nftDir') {if (readyModel && readyModel.objKey==='nft') SetModelDir(readyModel, nftDir);}
					else if (stateKey==='mbgbDir') {if (readyModel && readyModel.objKey==='mbgb') SetModelDir(readyModel, mbgbDir);}
					else if (stateKey==='selVegetable') {this.setVegetableMap();}
					else if (stateKey==='modelList') LoadSubModel(this, 'sump');
					if (reset) {this.emptyObjGroup()}
					if (photo) {this.takePhoto()}
				});
			}
		});
	}

	takePhoto = () => {
		const canvas = document.getElementsByTagName('canvas')[0];
		// const ctx = canvas.getContext("2d");
		// ctx.fillStyle = "blue";
		// ctx.fillRect(0, 0, canvas.width, canvas.height);
		// const base_image = new Image();
		// base_image.src = 'img/base.png';
		// base_image.onload = function(){
		//   context.drawImage(base_image, 0, 0);
		// }
		this.props.setLoading(true);
		const oldCamPos = {...this.camera.position};
		this.houseGroup.scale.y = 0.1;
		this.objectGroup.scale.y = 0.1;
		this.camera.position.set(0, 100, 0);
		this.camera.lookAt( 0, 0, 0 );
		this.camera.updateProjectionMatrix();

		setTimeout(() => {
			const MIME_TYPE = "image/png";
			const imgURL = canvas.toDataURL(MIME_TYPE);
			const dlLink = document.createElement('a');
			dlLink.download = 'aquaponics-design';
			dlLink.href = imgURL;
			dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
	
			document.body.appendChild(dlLink);
			dlLink.click();
			document.body.removeChild(dlLink);
		}, 500);

		setTimeout(() => {
			this.houseGroup.scale.y = 1;
			this.objectGroup.scale.y = 1;
			this.camera.position.set(oldCamPos.x, oldCamPos.y, oldCamPos.z);
			this.camera.lookAt( 0, 0, 0 );
			this.camera.updateProjectionMatrix();
			this.props.setLoading(false);
		}, 1000);
	}

	setLoading = (loading) => {
		// this.props.setLoading(loading);
	}

	emptyObjGroup = () => {
		for (let i = this.objectGroup.children.length - 1; i > 0; i--) {
			this.objectGroup.remove(this.objectGroup.children[i]);
			this.frameMeshArr.splice(i, 1);
		}
		this.updateObjectArr();
	}

	setDwcSize = () => {
		const {isSump, selDwcSize, selObjId, gSize} = this.state;
		if (!selDwcSize || !selObjId) return;
		const dwcSize = JSON.parse(selDwcSize), selDwc = this.objectGroup.children.find(item=>{return item.objId===selObjId});
		if (!dwcSize.x || !dwcSize.z || !selDwc) return;
		SetDwcSize(selDwc, {w:dwcSize.x, d:dwcSize.z});
		SetModelPosInfo(isSump, selDwc, gSize, this.objectGroup);
		this.updateObjectArr();
	}

	setObjPos = () => {
		const {isSump, selObjPos, selObjId, gSize} = this.state;
		if (!selObjPos || !selObjId) return;
		const objPos = JSON.parse(selObjPos), selObj = this.objectGroup.children.find(item=>{return item.objId===selObjId});
		if (!objPos.x || !objPos.z || !selObj) return;
		// if (selObj.objKey==='sump') {this.sumpPos={x:objPos.x, z:objPos.z}; this.controlSumptank(); return;}
		selObj.position.x = objPos.x; selObj.position.z = objPos.z;
		SetModelPosInfo(isSump, selObj, gSize, this.objectGroup);
		this.updateObjectArr();
	}

	onMouseDown = (e) => {
		if (e.button !== 0 || !this.camera || this.camera.position.y < 3 || this.state.selVegetable) return;
		this.mousePosDown = {x:e.clientX, y:e.clientY};
		const interPlane = GetRaycaster(this.camera, e, [this.planeMesh]);
		const interObject = GetRaycaster(this.camera, e, this.frameMeshArr);
		if (!interPlane || !interObject || !interObject.object || (interObject.object.objId !== this.state.selObjId) || !this.selObject) return;
		this.selObject.oriPos = {...this.selObject.position}
		this.planePosDown = GetFloorPos(interPlane);
		this.dragMode = true;
		this.controls.enableRotate = false;
	}

	onMouseMove = (e) => {
		if (!this.camera || this.camera.position.y < 3 || this.state.selVegetable) return;
		const {wSize} = this.state, {isSump, pushMode, gSize} = this.state;
		this.setRayPointer(e, wSize);
		const readyModel = GetReadyModel(this.objectGroup);
		const interPlane = GetRaycaster(this.camera, e, [this.planeMesh]);
		if (!interPlane) return;
		const planePos = GetFloorPos(interPlane);
		if (pushMode && readyModel) {
			if (!readyModel.visible) readyModel.visible = true;
			readyModel.position.set(planePos.x, 0, planePos.z);
			SetModelPosInfo(isSump, readyModel, gSize, this.objectGroup);
		} else if (this.dragMode) {
			const deltaPos = {x:planePos.x - this.planePosDown.x, z:planePos.z - this.planePosDown.z};
			const {oriPos} = this.selObject;
			const newX = oriPos.x + deltaPos.x, newZ = oriPos.z + deltaPos.z;
			this.selObject.position.x = newX;
			this.selObject.position.z = newZ;
			// SetModelPosInfo(this.selObject, gSize, this.objectGroup);
			this.props.setSelObjPos(JSON.stringify({x:GetRoundNum(newX), z:GetRoundNum(newZ)}));
		}
	}

	setRayPointer = (e, wSize) => {
		this.pointer.x = ( e.clientX / wSize.width ) * 2 - 1;
		this.pointer.y = - ( e.clientY / wSize.height ) * 2 + 1;
		this.raycaster.setFromCamera( this.pointer, this.camera );
	}

	onMouseUp = (e) => {
		if (e.button !== 0 || !this.camera || this.camera.position.y < 3 || this.state.selVegetable) return;
		if (e.target.closest('.side-bar') || e.target.closest('.help-tip')) return;
		const readyModel = GetReadyModel(this.objectGroup), {pushMode, isSump, gSize} = this.state;
		this.setRayPointer(e, this.state.wSize);
		const interPlane = GetRaycaster(this.camera, e, [this.planeMesh]);
		const planePos = GetFloorPos(interPlane);

		if (pushMode && readyModel) {
			// readyModel.visible = true;
			const frameMesh = readyModel.children.find(child=>{return child.frame});
			if (frameMesh) frameMesh.visible = false;

			if (device) {
				readyModel.visible = true;
				readyModel.position.set(planePos.x, 0, planePos.z);
				SetModelPosInfo(isSump, readyModel, gSize, this.objectGroup);
			}
			
			readyModel.ready = false;
			this.props.setPushMode(null);
			this.updateObjectArr();
			if (!isSump && readyModel.objKey==='dwc') {

			} else{
				setTimeout(() => { this.props.setPushMode(pushMode); }, 50);
			}
		} else {
			if (!this.mousePosDown) return;
			const clickFlag = this.mousePosDown.x === e.clientX && this.mousePosDown.y === e.clientY;
			if (clickFlag) {
				const intersect = GetRaycaster(this.camera, e, this.frameMeshArr);
				const selObjId = intersect?intersect.object.objId:null;
				this.props.setSelObjId(selObjId);
				this.selObject = this.objectGroup.children.find(object=>{return object.objId===selObjId});
				if (this.selObject) {
					const {objKey, rotation} = this.selObject;
					if (objKey==='nft' || objKey==='mbgb' || objKey==='sump') {
						const objDir = Math.round(rotation.y * 180 / Math.PI / 90);
						this.props.setObjDir(objDir);
					}
				}
			}
		}
		this.mousePosDown = null;
		this.dragMode = false;
		this.controls.enableRotate = true;
	}

	setPushMode = () => {
		const {pushMode} = this.state;
		const readyModel = GetReadyModel(this.objectGroup);
		if (readyModel) DelObject(this, readyModel.objId);
		if (pushMode) LoadSubModel(this, pushMode);
	}

	loadModel = () => {
		LoadPlane(this);
		LoadHouse(this);
		SetHouseSize(this, this.state.gSize);
		
		// const testGeo = new THREE.BoxGeometry(),
		// 	testMat = new THREE.MeshStandardMaterial({transparent:true, opacity:0.5});
		// this.testMesh = new THREE.Mesh(testGeo, testMat);
		// this.totalGroup.add(this.testMesh);
		// this.props.setPushMode('nft');
	}

	onReadyMap = (mapArr) => {
		this.plantMapArr = mapArr;
	}

	setVegetableMap = () => {
		const {selVegetable} = this.state;
		if (!selVegetable) return;
		const selMapItem = this.plantMapArr.find(item=>{return item.key===selVegetable});
		if (!selMapItem) return;
		this.objectGroup.children.forEach(object => {
			if (object.objKey !== 'nft' && object.objKey !== 'mbgb' && object.objKey !== 'dwc') return;
			object.children.forEach(child => {
				if (child.name !== 'plantGroup') return;
				child.visible = true;
				child.children.forEach(plant => {
					plant.material.map = selMapItem.map;
					plant.material.needsUpdate = true;
				});
			});
		});
	}

	controlSumptank = () => {
		const {isSump} = this.state;
		ControlSumptank(this.sumpModel, this.sumpD, isSump, this.sumpPos);
	}

	updateObjectArr = () => {
		const objectArr = [], {isSump, modelList} = this.state, needModelList = [];
		if (modelList.length===0) return;
		modelList.forEach(item => { needModelList.push({...item, needCount:0, count:0, size:0, price:0, volume:0}) });
		// const modelCount = {sump:0, nft:0, dwc:0, mbgb:0, fish:0, filter:0},
		// 		modelSize = {sump:0, nft:0, dwc:0, mbgb:0, fish:0, filter:0};
		var growSize = 0;
		this.objectGroup.children.filter(child=>{return !child.ready && child.visible}).forEach(object => {
			const {position, objId, rotation, dir, objKey} = object, {x, z} = position;
			const {label, price} = modelList.find(item=>{return item.key===objKey})
			const needItem = needModelList.find(need=>{return need.key===objKey});
			const objectItem = {posX:GetRoundNum(x), posZ:GetRoundNum(z), objId, label, objKey, price}
			needItem.count++;
			if (objKey==='filter' || objKey==='fish' || objKey==='sump') {
				objectItem.volume = needItem.unitSize;
				needItem.volume += needItem.unitSize;
			} else if (objKey==='dwc') {
				const {scale} = object.children[0], {x, z} = scale;
				objectItem.size = GetRoundNum(x*z, 2);
				objectItem.scale = {x, z};
				objectItem.price = price * objectItem.size;
				needItem.size += objectItem.size;
				growSize += objectItem.size;
			} else if (objKey==='nft' || objKey==='mbgb') {
				objectItem.size = needItem.unitSize;
				objectItem.dir = dir;
				needItem.size += needItem.unitSize;
				growSize += objectItem.size;
			}
			needItem.price += objectItem.price;

			objectArr.push(objectItem);
		});

		const needItemNft = needModelList.find(item=>{return item.key==='nft'}),
			needItemDwc = needModelList.find(item=>{return item.key==='dwc'}),
			needItemMbgb = needModelList.find(item=>{return item.key==='mbgb'}),
			needItemFish = needModelList.find(item=>{return item.key==='fish'});

		const needFish = Math.max(Math.ceil(growSize/250), 1),
			needFilter = Math.max(Math.ceil(growSize/125), 1);

		const needCount = {fish:needFish, filter:needFilter};
		const sumpExtLength = Math.max(needItemMbgb.count - 3, 0),
			sumpLength = GetRoundNum(0.8 + sumpExtLength*0.1),
			sumpInfo = modelList.find(item=>{return item.key==='sump'}),
			sumpPrice = sumpInfo.initPrice + sumpExtLength * sumpInfo.price;
		if (!isSump) {
			needCount.mbgb = 3;
			needCount.dwc = Math.max(needItemMbgb.count*1.5, 4.5);
		} else {
			const needMbgbSize = Math.ceil(needItemNft.count/4) + Math.ceil(needItemDwc.size/65),
				needMbgbFish = needItemFish.count * 3,
				needMbgb = Math.max(needMbgbSize, needMbgbFish, 3);
			needCount.mbgb = needMbgb;
			this.sumpD = sumpLength;
			objectArr.forEach(item => { if (item.objKey === 'sump') {item.price = sumpPrice; item.size = sumpLength;} });
			this.controlSumptank();
		}
		this.props.setObjectStr(JSON.stringify(objectArr));

		needModelList.forEach(model => {
			const {key} = model;
			model.needCount = needCount[key] || 0;
			if (key==='sump' && isSump) {
				model.volume = GetRoundNum(1.6 * 1.6 * Math.PI * this.sumpD, 2);
				model.price = sumpPrice;
			} else if (key==='nft' || key==='mbgb') {
				// model.size = modelCount[key] * model.unitSize;
			}
		});
		this.props.setNeedStr(JSON.stringify(needModelList));
	}

	initScene  = () => {
		const {wSize} = this.state;
		this.renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer: true});
		this.renderer.setSize(wSize.width, wSize.height);
		if (!document.getElementById("container")) return false;
		document.getElementById("container").appendChild(this.renderer.domElement);

		this.renderer.setClearColor(0xFFFFFF, 1);

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog( 0xFFFFFF, (planeSize/4) * 1.2, planeSize );
		this.camera = new THREE.PerspectiveCamera(30, wSize.width / wSize.height, 0.1, 1000);
		const realCamDis = device?camDis * 1.2 : camDis;
		this.camera.position.set(realCamDis, realCamDis, realCamDis);
		
		this.totalGroup = new THREE.Group(); this.scene.add(this.totalGroup);
		this.houseGroup = new THREE.Group(); this.totalGroup.add(this.houseGroup); this.houseGroup.objType = 'house';
		this.objectGroup = new THREE.Group(); this.totalGroup.add(this.objectGroup);
		// this.totalGroup.position.y = camDis/-20;
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.enabled = false;
		// this.controls.enableDamping = true;
		this.controls.enablePan = false;
		this.controls.minDistance = 5;
		this.controls.maxDistance = (planeSize/2) * 0.9;
		// this.controls.maxPolarAngle = Math.PI / 2 - 0.2; // this.controls.minPolarAngle = 0.3;
		// this.controls.addEventListener('change', () => {if (renderMethod !== 'time') this.rendering()})
		
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3); this.scene.add(this.ambientLight);
		this.shadowLight = new THREE.DirectionalLight(0xFFFFFF, 1 ); this.scene.add( this.shadowLight );
		this.shadowLight.position.set(1, 1, 1);
	}

	animate = () => {
		if (!this.camera || !this.scene) return;
		this.rendering();
		requestAnimationFrame(this.animate);
	}

	rendering = () => {
		if (!this.camera || !this.renderer) return;
		// this.camera.lookAt( 0, 0, 0 );
		// this.controls.update();
		this.renderer.render(this.scene, this.camera);
		// const camDis = this.camera.position;
		// this.shadowLight.position.set(camDis.x, camDis.y, camDis.z);
		// this.camera.updateProjectionMatrix();
	}

	render () {
		const {pageKey} = this.state;
		return (
			<div className={`back-board canvas ${pageKey==='canvas'?'active':''}`}>
				<div id='container'></div>
			</div>
		);
	}
}
