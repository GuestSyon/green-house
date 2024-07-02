import { GetRoundNum, corridorWidth, sizeDwc, sizeFilter, sizeFish, sizeNFT, sumpScl } from "../../data/common";
import { paperMesh, paperW } from "../../data/loader";

export function ControlSumptank(sumpGroup, sumpD, isSump, sumpP) {
	if (!sumpGroup) return;
	sumpGroup.visible = isSump;
	SetSumpDepth(sumpGroup, sumpD);
	// SetSumpPos(sumpGroup, sumpP);
}

function SetSumpDepth(sumpGroup, sumpD) {
	sumpGroup.children.forEach(child => {
		if (child.name==='main-box') {
			child.scale.y = sumpD;
			child.material.map.repeat.y = sumpD/2;
			child.position.z = -(sumpD/2)/sumpScl + 1.5;
		} else if (child.name==='stopper' || child.name==='manhole' || child.frame || child.outer) {
			// child.position.z = -(sumpD/2)/sumpScl + 1.5;
		} else if (child.frame || child.outer) {
			// child.scale.z = sumpD;
		}
	});
	sumpGroup.sizeInfo.d = sumpD;
}

// function SetSumpPos(sumpGroup, sumpP) {
// 	sumpGroup.position.x = sumpP.x;
// 	sumpGroup.position.z = sumpP.z;
// }

export function SetDwcSize(model, size) {
	const {d, w} = size;
	const basicMesh = model.children[0], panelMesh = model.children[1], frameMesh = model.children[2], outerMesh = model.children[3];
	basicMesh.scale.set(w, 1, d);
	panelMesh.scale.set(w - 0.05, 1, d - 0.05);
	frameMesh.scale.set(w + 0.1, 1, d + 0.1);
	outerMesh.scale.set(w + 0.1, 1, d + 0.1);
	panelMesh.material.map.repeat.set(w - 0.05, d - 0.05);
	model.sizeInfo = {w, d};
	const plantGroup = model.children.find(child=>{return child.name==='plantGroup'});
	for (let i = plantGroup.children.length - 1; i >= 0; i--) {
		plantGroup.remove(plantGroup.children[i]);
	}
	for (let i = w/-2+0.1; i <= w/2-0.1; i+=0.2) {
		for (let j = d/-2+0.1; j <= d/2-0.1; j+=0.2) {
			const clonePaper = paperMesh.clone(), rot = Math.random() * 360;
			clonePaper.position.set(i, sizeDwc.h - 0 + paperW/2, j);
			clonePaper.rotation.y = rot * Math.PI/180;
			plantGroup.add(clonePaper);
		}
	}
}

export function SetModelDir(model, dir) {
	if (!model) return;
	const {objKey} = model;
	if (objKey!=='nft' && objKey!=='mbgb' && objKey!=='sump') return;
	model.dir = dir;
	model.rotation.y = Math.PI/2 * dir;
}

export function UpdateObjErrPos(self) {
	const {objectGroup} = self, {isSump, gSize} = self.state;
	objectGroup.children.forEach(object => {
		if (CheckGSize(object.posInfo, gSize)) object.errorPos = ['out'];
		else if (object.errorPos[0]==='out') object.errorPos = [];
	});
}

const gridCount = 4;
const connectCount = 3, dwcAreaW = 3 * connectCount;

export function SetModelPosInfo(isSump, object, gSize, objectGroup) {
	if (!object) return;
	const {position, posInfo, sizeInfo, areaInfo, dir, objKey} = object,
		framePos = {...position}, modelRot = dir===1 || dir===3, {w, d} = sizeInfo,
		frameMesh = object.children.find(child=>{return child.frame===true}),
		outerMesh = object.children.find(child=>{return child.outer===true});
	const realSize = { w:modelRot?d:w, d:modelRot?w:d }
	if (!frameMesh || !outerMesh) return;
	// const {scale} = frameMesh, vSize = {x:scale.x - 0.1, z:scale.z - 0.1};
	
	posInfo.x0 = GetRoundNum(framePos.x - realSize.w/2, 3);
	posInfo.x1 = GetRoundNum(framePos.x + realSize.w/2, 3);
	posInfo.z0 = GetRoundNum(framePos.z - realSize.d/2, 3);
	posInfo.z1 = GetRoundNum(framePos.z + realSize.d/2, 3);
	if (areaInfo) {
		const areaSize = { w:modelRot?d:w+corridorWidth*2, d:modelRot?w+corridorWidth*2:d }
		areaInfo.x0 = GetRoundNum(framePos.x - areaSize.w/2, 3);
		areaInfo.x1 = GetRoundNum(framePos.x + areaSize.w/2, 3);
		areaInfo.z0 = GetRoundNum(framePos.z - areaSize.d/2, 3);
		areaInfo.z1 = GetRoundNum(framePos.z + areaSize.d/2, 3);
	}
	const verArr = [], {x0, x1, z0, z1} = posInfo;
	for (let i = 0; i <= gridCount; i++) {
		for (let j = 0; j <= gridCount; j++) {
			verArr.push({x:GetRoundNum(x0+i*(x1-x0)/gridCount, 3), z:GetRoundNum(z0+j*(z1-z0)/gridCount, 3)});
		}
	}
	object.verArr = [...verArr];
	CheckModelPos(isSump, object, gSize, objectGroup);
}

export function CheckModelPos(isSump, object, gSize, objectGroup) {
	if (!object) return;
	const {position, posInfo, verArr, areaInfo, objId, objKey, dir} = object,
		outerMesh = object.children.find(child=>{return child.outer===true});
	
	const oldErrPos = [...object.errorPos];
	var newErrPos = [];
	if (CheckGSize(posInfo, gSize)) newErrPos = ['out'];
	else if (objKey==='sump') {}
	else if (CheckSumpOver(isSump, posInfo, verArr, objectGroup)) newErrPos = ['sumpOver'];
	else if (CheckDwcConnect(isSump, objId, posInfo, objectGroup)) newErrPos = ['dwcError'];
	else if (CheckFilterRound(objId, objectGroup)) newErrPos = ['fishRound'];
	else newErrPos = GetErrorPos(isSump, objId, dir, posInfo, areaInfo, verArr, objectGroup);
	object.errorPos = [...newErrPos];
	outerMesh.visible = object.errorPos.length?true:false;
	ChangedErrPos(oldErrPos, newErrPos, objId, objectGroup);
}

function ChangedErrPos(oldArr, newArr, objId, objectGroup) {
	oldArr.filter(id=>{return id.includes('_')}).forEach(oldId => {
		const newItem = newArr.find(newId=>{return newId===oldId});
		if (!newItem) {
			const oldErrObj = objectGroup.children.find(obj=>{return obj.objId===oldId});
			const errIdx = oldErrObj.errorPos.findIndex(item=>{return item===objId});
			oldErrObj.errorPos.splice(errIdx, 1);
		}
	});
	newArr.filter(id=>{return id.includes('_')}).forEach(newId => { // id!=='out' && id!=='dwcError' && id!=='sumpOver'
		const oldItem = oldArr.find(oldId=>{return oldId===newId});
		if (!oldItem) {
			const newErrObj = objectGroup.children.find(obj=>{return obj.objId===newId});
			newErrObj.errorPos.push(objId);
		}
	});
	objectGroup.children.forEach(object => {
		const objOuterMesh = object.children.find(item=>{return item.outer===true});
		objOuterMesh.visible = object.errorPos.length > 0 ? true : false;
	});
}

function CheckGSize(posInfo, gSize) {
	const {x0, x1, z0, z1} = posInfo, {w, d} = gSize;
	return (x0 <= w/-2 || x1 >= w/2 || z0 <= d/-2 || z1 >= d/2);
}

function CheckSumpOver(isSump, posInfo, verArr, objectGroup) {
	if (!isSump) return false;
	const sumpObj = objectGroup.children.find(item=>{return item.objKey==='sump'});
	if (CheckInsideVer(verArr, sumpObj.posInfo)) return true;
	if (CheckInsideVer(sumpObj.verArr, posInfo)) return true;
	return false;
}

function CheckDwcConnect(isSump, objId, posInfo, objectGroup) {
	const objKey = objId.split('_')[0], {children} = objectGroup
	if (isSump || (objKey !== 'nft' && objKey !== 'mbgb' && objKey !== 'dwc')) return false; // || (objKey !== 'nft' && objKey !== 'mbgb')
	const dwcObj = children.find(obj=>{return obj.objKey==='dwc'}),
		nftArr = children.filter(obj=>{return obj.objKey==='nft' && obj.objId !== objId }),
		mbgbArr = children.filter(obj=>{return obj.objKey==='mbgb' && obj.objId !== objId });
	children.forEach(obj => {
		if (obj.objKey !== 'nft' && obj.objKey !== 'mbgb') return;
		if (!dwcObj) {obj.errorPos = ['dwcError']; return;}
		else if (ReCheckDwcError(dwcObj.posInfo, obj, obj.objKey==='nft'?nftArr:mbgbArr)) obj.errorPos = ['dwcError'];
		else if (obj.errorPos[0]==='dwcError') obj.errorPos = [];
	});
	const selObj = children.find(obj=>{return obj.objId===objId});
	if (selObj.errorPos[0]==='dwcError') return true;
	else return false;

	// const selObj = children.find(obj=>{return obj.objId===objId});
	// var flagError = false;
	// if (ReCheckDwcError(dwcObj.posInfo, selObj, objKey==='nft'?nftArr:mbgbArr)) flagError = true;
	// return flagError;
}

function ReCheckDwcError(dwcPos, obj, objArr) {
	const {posInfo, dir} = obj, {x0, x1, z0, z1} = posInfo, mainVerArr = [{x:x0, z:z0}, {x:x1, z:z0}, {x:x0, z:z1}, {x:x1, z:z1}];
	const {axis, side} = GetPosArea(dwcPos, mainVerArr[0]);
	if (!axis) return true;
	var flagError = false;
	mainVerArr.forEach((ver, idx) => {
		if (idx === 0 || flagError) return;
		const verPosInfo = GetPosArea(dwcPos, ver);
		if (axis !== verPosInfo.axis || side !== verPosInfo.side) {flagError = true;}
	});
	if (flagError) return true;
	const dir0Arr = objArr.filter(item=>{return item.dir===0}),
		  dir1Arr = objArr.filter(item=>{return item.dir===1});
	var unitCount, connectObjArr;
	if (axis==='x') {
		if 		(side===-1 && x1===dwcPos.x0) return false;
		else if (side=== 1 && x0===dwcPos.x1) return false;
		else if (dir===0) return true;
		else unitCount = GetDwcUnitDis(dwcPos, 'x', side, posInfo);
		connectObjArr = dir1Arr;
	} else {
		if 		(side===-1 && z1===dwcPos.z0) return false;
		else if (side=== 1 && z0===dwcPos.z1) return false;
		else if (dir===1) return true;
		else unitCount = GetDwcUnitDis(dwcPos, 'z', side, posInfo);
		connectObjArr = dir0Arr;
	}
	if (unitCount) {
		const connect1 = GetDwcConnectObj(connectObjArr, axis, side, posInfo, 1);
		if (!connect1) return true;
		if (unitCount === 1) return false;
		else {
			const connect2 = GetDwcConnectObj(connectObjArr, axis, side, posInfo, 2);
			if (connect2) return false;
		}
	}
	return true;
}

function GetDwcConnectObj(objArr, axis, side, posInfo, num) {
	var selObj;
	objArr.forEach(obj=>{
		if (selObj) return;
		if (axis==='x') {
			if (posInfo.z0 !== obj.posInfo.z0) return;
			if (obj.posInfo.x0 === GetRoundNum(posInfo.x0+3*num * side * -1, 2)) selObj = obj;
		} else {
			if (posInfo.x0 !== obj.posInfo.x0) return;
			if (obj.posInfo.z0 === GetRoundNum(posInfo.z0+3*num * side * -1, 2)) selObj = obj;
		}
	})
	return selObj?true:false;
}

function GetDwcUnitDis(dwcPos, axis, side, posInfo) {
	var dwcDis;
	if (side===-1) { dwcDis = dwcPos[axis+'0'] - posInfo[axis+'1']; }
	else 		   { dwcDis = posInfo[axis+'0'] - dwcPos[axis+'1']; }
	dwcDis = GetRoundNum(dwcDis, 3);
	if 		(dwcDis===3) return 1;
	else if (dwcDis===6) return 2;
	else return false;
}

function GetPosArea(dwcPos, ver) {
	const {x0, x1, z0, z1} = dwcPos, {x, z} = ver;
	if 		(x <= x0 && x >= x0 - dwcAreaW && z >= z0 && z <= z1) return {axis:'x', side:-1};
	else if (x >= x1 && x <= x1 + dwcAreaW && z >= z0 && z <= z1) return {axis:'x', side: 1};
	else if (z <= z0 && z >= z0 - dwcAreaW && x >= x0 && x <= x1) return {axis:'z', side:-1};
	else if (z >= z1 && z <= z1 + dwcAreaW && x >= x0 && x <= x1) return {axis:'z', side: 1};
	return {};
}

function CheckFilterRound(objId, objectGroup) {
	const minDis = (sizeFilter.w + sizeFish.w)/2, maxDis = minDis + 0.7;
	const objKey = objId.split('_')[0];
	if (objKey !== 'filter' && objKey !== 'fish') return false;
	const fishArr = objectGroup.children.filter(object=>{return object.objKey==='fish'});
	const filterArr = objectGroup.children.filter(object=>{return object.objKey==='filter'});
	// if (!fishArr.length) return true;
	fishArr.forEach(fish => { fish.filterArr = []; });
	filterArr.forEach(filter => {
		var flagDisFish = false;
		fishArr.forEach(fish => {
			if (fish.filterArr.length >= 2 || flagDisFish) return;
			const disFish = Math.sqrt(Math.pow(filter.position.x - fish.position.x, 2) + Math.pow(filter.position.z - fish.position.z, 2));
			// console.log(GetRoundNum(disFish, 2));
			if (disFish >= minDis && disFish <= maxDis) {fish.filterArr.push(filter.objId); flagDisFish = true;}
		});
		if (!flagDisFish) {
			const oldErrArr = [...filter.errorPos];
			oldErrArr.forEach(oldErrId => {
				if (!oldErrId.includes('_')) return;
				const selOldObj = objectGroup.children.find(item=>{return item.objId===oldErrId});
				const filterErrIdx = selOldObj.errorPos.findIndex(errId=> {return errId===filter.objId});
				selOldObj.errorPos.splice(filterErrIdx, 1);
			});
			filter.errorPos = ['fishRound'];
		} else {
			filter.errorPos = [];
		}
	});
	if (objKey==='fish') return false;
	const selFilter = filterArr.find(item=>{return item.objId===objId});
	if (selFilter && selFilter.errorPos[0]==='fishRound') return true;
	else return false;
}

function GetErrorPos(isSump, objId, dir, posInfo, areaInfo, verArr, objectGroup) {
	const errorPos = [], objKey = objId.split('_')[0];

	objectGroup.children.filter(object=>{
		var flagOther = true, errorFirst = object.errorPos[0];
		if 		(object.objId===objId) flagOther = false;
		else if (object.objKey==='sump') flagOther = false;
		else if (errorFirst && !errorFirst.includes('_') ) flagOther = false; // errorFirst==='out' || errorFirst==='dwcError' || errorFirst==='sumpOver' || errorFirst==='fishRound'
		else if (objKey==='filter' && object.objKey==='fish' && object.filterArr.includes(objId)) flagOther = false;
		else if (objKey==='fish' && object.objKey==='filter') {
			const objectItem = objectGroup.children.find(item=>{return item.objId===objId});
			if (objectItem.filterArr.includes(object.objId)) flagOther = false;
		}
		return flagOther;
	}).forEach(object => {
		const objPosInfo = object.posInfo, objAreaInfo = object.areaInfo, objDir = object.dir, objVerArr = object.verArr;
		var checkObjOver = CheckInsideVer(verArr, objPosInfo);

		if (!checkObjOver && areaInfo && (objDir===undefined || dir === objDir) && (isSump || object.objKey !== 'dwc')) {
			if (CheckInsideVer(objVerArr, areaInfo)) checkObjOver = true;
		}
		if (!checkObjOver && objAreaInfo && (dir===undefined || dir === objDir) && (isSump || objKey !== 'dwc')) {
			if (CheckInsideVer(verArr, objAreaInfo)) checkObjOver = true;
		}
		if (checkObjOver) {
			errorPos.push(object.objId);
		}
	});
	return errorPos;
}

function CheckInsideVer(verArr, posInfo) {
	const {x0, x1, z0, z1} = posInfo;
	var flagCheck = false;
	verArr.forEach(ver => {
		if (flagCheck) return;
		if (ver.x > x0 && ver.x < x1 &&
			ver.z > z0 && ver.z < z1) flagCheck = true;
	});
	return flagCheck;
}