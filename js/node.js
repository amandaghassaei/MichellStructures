/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeGeometry = new THREE.CircleGeometry(4,20);

function Node(position, index, mirror){
    this.index = index;
    position = position.clone();
    if (mirror) {
        position.y *= -1;
        this.mirror = true;
    }
    this.object3D = new THREE.Mesh(nodeGeometry, nodeMaterial);
    this.object3D.visible = false;
    this.object3D.position.set(position.x, position.y, position.z);
    sceneAdd(this.object3D);
    this.beams = [];
}

Node.prototype.addBeam = function(beam){
    this.beams.push(beam);
};

Node.prototype.getBeams = function(){
    return this.beams;
};

Node.prototype.getIndex = function(){//in nodes array
    return this.index;
};

Node.prototype.getPosition = function(){
    return this.object3D.position;
};

Node.prototype.move = function(position){
    this.object3D.position.set(position.x, position.y, position.z);
    if (this.mirror) this.object3D.position.y *= -1;
    _.each(this.beams, function(beam){
        beam.updatePosition();
    });
};

Node.prototype.destroy = function(){
    this.object3D = null;
    this.beams = null;
};