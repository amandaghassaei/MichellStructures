/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeGeometry = new THREE.CircleGeometry(1,20);

function Node(position, mirror){
    position = position.clone();
    if (mirror) position.y *= -1;
    this.object3D = new THREE.Mesh(nodeGeometry, nodeMaterial);
    this.object3D.position.set(position.x, position.y, position.z);
    sceneAdd(this.object3D);
}

Node.prototype.getPosition = function(){
    return this.object3D.position;
};

Node.prototype.destroy = function(){
    sceneRemove(this.object3D);
    this.object3D = null;
};