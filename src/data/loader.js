import * as THREE from 'three';

import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import imgFloor from '../assets/images/floor0.jpg';

import fbxNFT from '../assets/model/nft.fbx';
import fbxFilter from '../assets/model/filter.fbx';
import fbxFish from '../assets/model/fish.fbx';
import fbxDwc from '../assets/model/dwc.fbx';
import fbxMbgb from '../assets/model/mbgb.fbx';
import fbxSump from '../assets/model/sump.fbx';
import imgFilterBlackLine from '../assets/model/filter-black-line.jpg';
import imgTankBlueLine from '../assets/model/tank-blue-line.jpg';
import imgConcrete from '../assets/model/concrete.jpg';
import imgSky1 from '../assets/model/sky-1.jpg';
import imgSoil from '../assets/model/soil.jpg';
import imgDoor from '../assets/model/door.png';
import imgWood from '../assets/model/wood.jpg';
import imgWood1 from '../assets/model/wood1.jpg';
import imgDwcPanel from '../assets/model/dwc-panel.jpg';

import { planeSize, houseH, sizeDwc, sizeFilter, sizeFish, sizeMbgb, sizeNFT, sizeSump, GetIdStr, inch2m, sumpScl } from './common';
import { CheckModelPos, SetDwcSize, SetModelPosInfo, UpdateObjErrPos } from '../assets/controls/ModelControl';

const doorSize = 2.2, glassMethod = false;

export function LoadPlantMapArr(self, cropList) {
	const plantMapArr = [];
	cropList.forEach(crop => {
		new THREE.TextureLoader().load('./plant/'+crop.key+'.png', ( texture ) => {
			plantMapArr.push({key:crop.key, map: texture});
			if (plantMapArr.length===cropList.length) self.onReadyMap(plantMapArr);
		}, undefined, ( err ) => { console.error( 'An error happened.' ); } );
	});
}

export function SetHouseSize(self, gSize, checkObj) {
	self.houseGroup.children.forEach(child => {
		const {axis, dir, vPillar, xPos, zPos, door, doorDir} = child;
		if (door) {
			child.position.z = gSize.d * doorDir/2;
		} else if (vPillar) {
			child.position.set(xPos/2*gSize.w, houseH/2, zPos/2*gSize.d);
		} else if (axis === 'y') {
			child.scale.set(gSize.w, 1, gSize.d);
		} else if (axis === 'x') {
			child.scale.set(1, 1, gSize.d);
			child.position.x = dir * gSize.w/2;
		} else if (axis === 'z') {
			child.scale.set(gSize.w, 1, 1);
			child.position.z = dir * gSize.d/2;
		}
	});
	self.mapConcrete.repeat.set(gSize.w, gSize.d);
	self.updateObjectArr();
	if (checkObj) UpdateObjErrPos(self);
}

export function LoadHouse(self) {
	const mapConcrete = new THREE.TextureLoader().load(imgConcrete);
	mapConcrete.wrapS = mapConcrete.wrapT = THREE.RepeatWrapping;
	self.mapConcrete = mapConcrete;

	const mapDoor = new THREE.TextureLoader().load(imgDoor);
	const matDoor = new THREE.MeshStandardMaterial({map:mapDoor, transparent:true});

	const pillarMat = new THREE.MeshStandardMaterial({color:0x888888});

	['x', 'y', 'z'].forEach(axis => {
		[-1, 1].forEach(dir => {
			const geoSize = {x:1, y:1, z:1}, flagFloor = axis==='y'&&dir===-1;
			geoSize[axis] = 0.1;
			if (axis !== 'y') geoSize.y = houseH;
			const transparent = !flagFloor,
				opacity = flagFloor?1:0.3,
				color = flagFloor?0xFFFFFF:0xBBCCFF,
				map = flagFloor?self.mapConcrete:undefined;
			const wallGroup = new THREE.Group();
			const wallGeo = new THREE.BoxGeometry(geoSize.x, geoSize.y, geoSize.z);
			const wallMat = new THREE.MeshStandardMaterial({transparent, opacity, color, map});
			const wallMesh = new THREE.Mesh(wallGeo, wallMat);
			wallGroup.axis = axis; wallGroup.dir = dir;
			wallGroup.flagFloor = flagFloor;
			if (!glassMethod) wallMesh.visible = flagFloor;
			wallGroup.add(wallMesh);

			if (axis==='y') {
				wallMesh.position.y = dir===-1?-0.1:houseH;
				[-1, 1].forEach(zPos => {
					const pillarGeo = new THREE.BoxGeometry(0.1, houseH, 0.1);
					const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
					pillarMesh.vPillar = true;
					pillarMesh.xPos = dir; pillarMesh.zPos = zPos;
					self.houseGroup.add(pillarMesh);
				});
			} else {
				wallGroup.position.y = houseH/2;
				[-1, 1].forEach(hPos => {
					const pillarSize = {x:1, y:0.1, z:1};
					pillarSize[axis] = 0.1;
					const pillarGeo = new THREE.BoxGeometry(pillarSize.x, pillarSize.y, pillarSize.z);
					const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
					pillarMesh.position.y = hPos/2 * houseH;
					wallGroup.add(pillarMesh);
				});	
				if (axis==='z') {
					const doorGeo = new THREE.BoxGeometry(doorSize, doorSize, 0.2);
					const doorMesh = new THREE.Mesh(doorGeo, matDoor);
					doorMesh.door = true; doorMesh.doorDir = dir;
					doorMesh.position.y = doorSize/2;
					self.houseGroup.add(doorMesh);
				}
			}
			self.houseGroup.add(wallGroup);
		});
	});
}

export function LoadPlane(self) {
	const planeMap = new THREE.TextureLoader().load(imgFloor);
	planeMap.wrapS = planeMap.wrapT = THREE.RepeatWrapping;
	planeMap.repeat.set( 50, 50 );
	const planeGeo = new THREE.BoxGeometry(planeSize, 0.1, planeSize);
	const planeMat = new THREE.MeshStandardMaterial({map:planeMap});
	self.planeMesh = new THREE.Mesh(planeGeo, planeMat);
	self.planeMesh.objType = 'plane';
	self.planeMesh.position.y = -0.15;
	self.totalGroup.add(self.planeMesh);

	const skyGeo = new THREE.SphereGeometry(planeSize/2, 64, 64);
	const skyMap = new THREE.TextureLoader().load(imgSky1);
	const skyMat = new THREE.MeshBasicMaterial({map:skyMap, side:2});
	self.skyMesh = new THREE.Mesh(skyGeo, skyMat);
	self.planeMesh.objType = 'sky';
	self.totalGroup.add(self.skyMesh);
}

const mapFilterBlack = new THREE.TextureLoader().load(imgFilterBlackLine);
mapFilterBlack.wrapS = mapFilterBlack.wrapT = THREE.RepeatWrapping;

const mapSoil = new THREE.TextureLoader().load(imgSoil);
mapSoil.wrapS = mapSoil.wrapT = THREE.RepeatWrapping;
mapSoil.repeat.set(2, 6);

const mapWood = new THREE.TextureLoader().load(imgWood);
const mapWood1 = new THREE.TextureLoader().load(imgWood1);

const mapConcrete = new THREE.TextureLoader().load(imgConcrete);
mapConcrete.wrapS = mapConcrete.wrapT = THREE.RepeatWrapping;

export const paperW = 0.5;
const paperGeo = new THREE.PlaneGeometry(paperW, paperW),
	paperMat = new THREE.MeshBasicMaterial({transparent:true, color:0xFFFFFF, side:2, depthWrite: true});
export const paperMesh = new THREE.Mesh(paperGeo, paperMat);

export function LoadSubModel(self, key) {
	var fbxModel;
	if 		(key==='nft') fbxModel = fbxNFT;
	else if (key==='filter') fbxModel = fbxFilter;
	else if (key==='fish') fbxModel = fbxFish;
	else if (key==='dwc') {CreateDWCModel(self); return;}
	else if (key==='mbgb') fbxModel = fbxMbgb;
	else if (key==='sump') fbxModel = fbxSump;

	const {isSump, gSize, systemDir, nftDir, mbgbDir} = self.state;

	// const testLabel = document.getElementById('testLabel');
	// testLabel.innerHTML=key;

	const loader = new FBXLoader(), objIdStr = key+'_'+GetIdStr();
	self.setLoading(true);
	loader.load(fbxModel, (fbx) => {
		self.setLoading(false);
		// testLabel.innerHTML='load';
		const object = fbx; // .children[0]
		const vPos = new THREE.Box3(new THREE.Vector3()).setFromObject(object), {min, max} = vPos;
		const vSize = {x:max.x-min.x, y:max.y-min.y, z:max.z-min.z};
		var scl = {x:1, y:1, z:1}, defaultSize;
		if (key==='nft') {
			defaultSize = sizeNFT;
			const sclX = sizeNFT.w / vSize.x, sclZ = sizeNFT.d / vSize.z, sclY = sizeNFT.h / vSize.y;
			scl = {x:sclX, y:sclY, z:sclZ};
		} else if (key==='filter') {
			defaultSize = sizeFilter;
			const sclZ = sizeFilter.w / vSize.z, sclY = sizeFilter.h / vSize.y;
			scl = {x:sclZ, y:sclY, z:sclZ};
		} else if (key==='fish') {
			defaultSize = sizeFish;
			const sclZ = sizeFish.w / vSize.z, sclY = sizeFish.h / vSize.y;
			scl = {x:sclZ, y:sclY, z:sclZ};
			object.filterArr = [];
		} else if (key==='mbgb') {
			defaultSize = sizeMbgb;
			const sclX = sizeMbgb.w/vSize.x, sclZ = sizeMbgb.d/vSize.z, sclY = sizeMbgb.h/vSize.y;
			scl = {x:sclX, y:sclY, z:sclZ};
		} else if (key==='sump') {
			defaultSize = sizeSump;
			const sclX = sizeSump.w/vSize.x;
			scl = {x:sclX, y:sclX, z:sclX};
		}

		object.scale.set(scl.x, scl.y, scl.z);

		object.children.forEach(child => {
			if (key==='filter') {
				if (child.name==='main-frame') {
					child.material.map = mapFilterBlack;
					child.material.side = 2;
				} else {
					child.material = new THREE.MeshStandardMaterial({});
				}
			} else if (key==='fish') {
				if (child.name==='plane') {
					child.material.color.setHex(0x009CCB);
				} else if (child.name.includes('main-frame')) {
					const mapTankBlue = new THREE.TextureLoader().load(imgTankBlueLine);
					mapTankBlue.wrapS = mapTankBlue.wrapT = THREE.RepeatWrapping;
					var repeatNum = 1;
					if 		(child.name==='main-frame1') repeatNum = 0.3;
					else if (child.name==='main-frame2') repeatNum = 0.1;
					mapTankBlue.repeat.set( repeatNum, 1 );
					// mapTankBlue.repeat.set( 1, repeatNum );
					child.material.map = mapTankBlue;
				} else if (child.name.includes('window-frame')) {
					child.material.color.setHex(0xFFFF33);
				} else if (child.name.includes('window-glass')) {
					child.material = new THREE.MeshStandardMaterial({transparent:true, opacity:0.5, color:0x00CCFF})
				} else if (child.name.includes('pipe')) {
					child.material.color.setHex(0x333333);
				}
			} else if (key==='dwc') {
				if (child.name==='main-frame') {
					child.material = new THREE.MeshStandardMaterial({map:mapWood});
				}
			} else if (key==='mbgb') {
				if (child.name.includes('main-frame')) {
					child.material = new THREE.MeshStandardMaterial({map:mapWood1});
				} else if (child.name==='soil') {
					child.material.map = mapSoil;
					child.material.needsUpdate = true;
				} else if (child.name.includes('leg')) {
					child.material = new THREE.MeshStandardMaterial({map:mapConcrete, color:0xDDDDDD});
					// child.material.color.setHex(0x333333);
				}
			} else if (key==='sump') {
				if (child.name==='main-box') {
					const mapTankBlue = new THREE.TextureLoader().load(imgTankBlueLine);
					mapTankBlue.wrapS = mapTankBlue.wrapT = THREE.RepeatWrapping;
					child.material.map = mapTankBlue;
				} else if (child.name==='stopper') {
					child.material.color.setHex(0x009CCB);
				} else if (child.name==='manhole') {
					child.material.color.setHex(0x663300)
				}
			}
		});
		const {frameMesh, outerMesh} = GetFrameMesh(key, vSize), {w, d} = defaultSize;
		object.add(frameMesh, outerMesh);
		object.objId = frameMesh.objId = objIdStr;
		object.objKey = frameMesh.objKey = key;
		object.posInfo = {};
		object.verArr = [];
		object.sizeInfo = {w, d};
		object.errorPos = [];
		if (key==='nft' || key==='mbgb') {
			var dir = key==='nft'?nftDir:mbgbDir;
			if (isSump) dir = systemDir;
			if (dir===1) {
				object.rotation.y = Math.PI/2;
			}
			object.dir = dir;
			object.areaInfo = {};
			const plantGroup = new THREE.Group();
			plantGroup.name = 'plantGroup';
			plantGroup.scale.set(1/scl.x, 1/scl.y, 1/scl.z);
			plantGroup.visible = false;
			// 0.36 0.12, 1.36 / 0.1943
			if (key==='nft') {
				for (let i = -7; i <= 7; i++) {
					[-1, 1].forEach(side => {
						for (let j = 0; j < 5; j++) {
							const clonePaper = paperMesh.clone(), rot = Math.random() * 360;
							clonePaper.position.set((0.36 - 0.06*j) * side, 0.23 + paperW/2 + 0.28 * j, i * 0.1943);
							clonePaper.rotation.y = rot * Math.PI/180;
							plantGroup.add(clonePaper);
						}
					});
				}
			} else {
				const intVal = 0.2;
				for (let i = sizeMbgb.d/-2 + 0.1; i <= sizeMbgb.d/2 - 0.1; i+=intVal) {
					for (let j = sizeMbgb.w/-2 + 0.1; j <= sizeMbgb.w/2 - 0.1; j+=intVal) {
						const clonePaper = paperMesh.clone(), rot = Math.random() * 360;
						clonePaper.position.set(j, sizeMbgb.h - 0.1 + paperW/2, i);
						clonePaper.rotation.y = rot * Math.PI/180;
						plantGroup.add(clonePaper);
					}
				}
			}
			object.add(plantGroup);
		}
		self.frameMeshArr.push(frameMesh);
		self.objectGroup.add(object);

		if (key==='sump') {
			object.sizeInfo = {w:1, d:1};
			object.position.y = sizeSump.w/-2 - 0.35;
			self.sumpModel = object;
			frameMesh.visible = false;
			outerMesh.visible = false;
			self.controlSumptank();
			self.updateObjectArr();
			SetModelPosInfo(isSump, object, gSize, self.objectGroup);
		} else {
			object.ready = true;
			object.visible = false;
		}
		self.setVegetableMap();
	}, (xhr) => {   }, (error) => { })
}

export function CreateDWCModel(self) {
	const object = new THREE.Group();
	const basicGeo = new THREE.BoxGeometry(1, sizeDwc.h, 1),
		basicMat = new THREE.MeshStandardMaterial({map:mapWood}),
		basicMesh = new THREE.Mesh(basicGeo, basicMat),
		panelGeo = new THREE.BoxGeometry(1, 0.02, 1),
		panelMap = new THREE.TextureLoader().load(imgDwcPanel),
		panelMat = new THREE.MeshStandardMaterial({map:panelMap}),
		panelMesh = new THREE.Mesh(panelGeo, panelMat);
	panelMap.wrapS = panelMap.wrapT = THREE.RepeatWrapping;
	basicMesh.name = 'basic'; basicMesh.position.y = sizeDwc.h/2;
	panelMesh.name = 'panel'; panelMesh.position.y = sizeDwc.h;
	object.add(basicMesh, panelMesh);
	const objIdStr = 'dwc_'+GetIdStr();
	const {frameMesh, outerMesh} = GetFrameMesh('dwc', {x:0.9, y:sizeDwc.h, z:0.9});
	object.add(frameMesh, outerMesh);
	object.objKey = 'dwc';
	object.objId = frameMesh.objId = objIdStr;
	object.posInfo = {};
	object.verArr = [];
	object.sizeInfo = {w:1, d:1};
	object.errorPos = [];
	const plantGroup = new THREE.Group();
	plantGroup.name = 'plantGroup';
	plantGroup.visible = false;
	object.add(plantGroup);
	self.frameMeshArr.push(frameMesh);

	object.ready = true;
	object.visible = false;
	SetDwcSize(object, sizeDwc);
	self.objectGroup.add(object);
	self.setVegetableMap();
}

function GetFrameMesh(key, vSize) {
	const outSize = key==='sump'?{x:1/sumpScl, y:0.05/sumpScl, z:1/sumpScl}:{...vSize}
	const frameGeo = new THREE.BoxGeometry(outSize.x+0.1, outSize.y+0.1, outSize.z+0.1);
	const frameMat = new THREE.MeshStandardMaterial({color:0x0000FF, transparent:true, opacity:0.5, depthTest:!glassMethod});
	const frameMesh = new THREE.Mesh(frameGeo, frameMat);
	frameMesh.position.y = key==='sump'?4.5:outSize.y / 2; //  
	frameMesh.frame = true;
	const outerGeo = new THREE.BoxGeometry(outSize.x+0.1, outSize.y+0.1, outSize.z+0.1);
	const outerMat = new THREE.MeshStandardMaterial({color:0xFF0000, wireframe:true});
	const outerMesh = new THREE.Mesh(outerGeo, outerMat);
	outerMesh.position.y = key==='sump'?4.5:outSize.y / 2; //  
	outerMesh.outer = true;
	outerMesh.visible = false;
	return {frameMesh, outerMesh};
}

export function GetReadyModel(objectGroup) {
	return objectGroup.children.find(child=>{return child.ready});
}

export function DelObject(self, delObjId) {
	if (!delObjId) return;
	self.objectGroup.children.forEach(object => {
		if (object.objId===delObjId) {
			self.objectGroup.remove(object);
			const frameIdx = self.frameMeshArr.findIndex(item=>{return item.objId===delObjId});
			self.frameMeshArr.splice(frameIdx, 1);
		} else {
			const errorIdx = object.errorPos.findIndex(errorId=>{return errorId===delObjId});
			if (errorIdx > -1) {
				object.errorPos.splice(errorIdx, 1);
				if (object.errorPos.length===0) {
					const outerMesh = object.children.find(child=>{return child.outer===true});
					outerMesh.visible = false;
				}
			}
		}
	});
}

export function SetFrameMeshArr (frameMeshArr, selObjId) {
	frameMeshArr.forEach(frameMesh => { frameMesh.visible = frameMesh.objId===selObjId; });
}