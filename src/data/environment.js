
export function SetShowHouse(houseGroup, val) {
	houseGroup.children.forEach(child => {
		if (child.flagFloor) return;
		child.visible = val;
	});
}

export function SetShowGround(self, val) {
	self.planeMesh.visible = val;
	self.skyMesh.visible = val;
}

export function SetTransFloor(planeMesh, houseGroup, mapConcrete, val) {
	const floorMesh = houseGroup.children.find(child=>{return child.flagFloor===true});
	if (!floorMesh || !floorMesh.children[0]) return;
	// planeMesh.visible = !val;
	floorMesh.children[0].material.transparent = val;
	floorMesh.children[0].material.opacity = val?0.3:1;
	floorMesh.children[0].material.map = val?undefined:mapConcrete;
	floorMesh.children[0].material.needsUpdate = true;
}