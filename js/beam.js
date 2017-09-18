/**
 * Created by ghassaei on 9/16/16.
 */

//var beamMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});

var defaultColor = 0x444444;

var beamGeometry = new THREE.Geometry();
beamGeometry.vertices.push(new THREE.Vector3(-2,-0.5,0));
beamGeometry.vertices.push(new THREE.Vector3(-2,0.5,0));
beamGeometry.vertices.push(new THREE.Vector3(2,0.5,0));
beamGeometry.vertices.push(new THREE.Vector3(2,-0.5,0));
beamGeometry.faces.push(new THREE.Face3(1,0,3));
beamGeometry.faces.push(new THREE.Face3(3,2,1));

function Beam(nodes){

    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.vertices = [nodes[0].getPosition(), nodes[1].getPosition()];

    var lineGeometry = new THREE.Geometry();
    lineGeometry.dynamic = true;
    lineGeometry.vertices = this.vertices;
    var material = new THREE.MeshBasicMaterial();

    this.object3D = new THREE.Mesh(beamGeometry, material);
    this.object3D._myBeam = this;
    sceneAdd(this.object3D);
    this.object3D.scale.x = 0.05;
    this.updatePosition();

    this.reset();
}

Beam.prototype.highlight = function(){
};

Beam.prototype.unhighlight = function(){

};

Beam.prototype.getAngle = function(fromNode){
    var node2 = this.vertices[0];
    if (node2.equals(fromNode)) node2 = this.vertices[1];
    return Math.atan2(node2.y-fromNode.y, node2.x-fromNode.x);
};

Beam.prototype.setColor = function(val, max, min){
    var scaledVal = (1-(val - min)/(max - min)) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.setTensionCompressionColor = function(val, max){
    var scaledVal = Math.pow(val/max, 1/2);
    if (this.isInCompression()){
        this.object3D.material.color.setRGB(scaledVal, 0, 0);
    } else {
        this.object3D.material.color.setRGB(0, 0, scaledVal);
    }
};

Beam.prototype.setDefaultColor = function(){
    this.object3D.material.color.setHex(defaultColor);
};

Beam.prototype.reset = function(){
    this.inCompression = false;
    this.force = null;
};

Beam.prototype.setForce = function(forceMag, angle){
    if (forceMag<0) this.inCompression = true;
    this.force = new THREE.Vector3(forceMag*Math.cos(angle), forceMag*Math.sin(angle), 0);
    this.updateThickness();
};

Beam.prototype.updateThickness = function(){
    if (window.viewMode == "none") {
        var diameter = 0.025;
        if (this.force.length()>0) diameter = Math.sqrt(this.force.length())/20;
        if (diameter<0.025) diameter = 0.025;
        this.object3D.scale.x = diameter;
    } else this.object3D.scale.x = 0.05;
};

Beam.prototype.getForce = function(){
    if (this.force == null) return null;
    return this.force.clone().multiplyScalar(-1);
};

Beam.prototype.getForceMagnitude = function(){
    return this.force.length();
};

Beam.prototype.isInCompression = function(){
    return this.inCompression;
};

Beam.prototype.getLength = function(){
    return this.vertices[0].clone().sub(this.vertices[1]).length();
};


Beam.prototype.updatePosition = function(){
    this.object3D.scale.y = this.getLength();
    var angle = this.getAngle(this.vertices[0])-Math.PI/2;
    var position = (this.vertices[0].clone().add(this.vertices[1].clone())).multiplyScalar(0.5);
    this.object3D.position.set(position.x, position.y, position.z);
    this.object3D.rotation.z = angle;
};
// Beam.prototype.updatePosition = function(){
//     this.object3D.geometry.verticesNeedUpdate = true;
//     //this.object3D.geometry.normalsNeedUpdate = true;
//     //this.object3D.geometry.computeFaceNormals();
//     //this.object3D.geometry.computeVertexNormals();
//     this.object3D.geometry.computeBoundingSphere();
// };

Beam.prototype.destroy = function(){
    this.vertices = null;
    this.object3D._myBeam = null;
    this.object3D = null;
};