/**
 * Created by ghassaei on 9/16/16.
 */

//var beamMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});

var defaultColor = 0x0000ff;

function Beam(nodes){

    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.vertices = [nodes[0].getPosition(), nodes[1].getPosition()];

    var lineGeometry = new THREE.Geometry();
    lineGeometry.dynamic = true;
    lineGeometry.vertices = this.vertices;
    var material = new THREE.LineBasicMaterial({color: defaultColor, linewidth: 3});

    this.object3D = new THREE.Line(lineGeometry, material);
    this.object3D._myBeam = this;
    sceneAdd(this.object3D);

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

Beam.prototype.setDefaultColor = function(){
    this.object3D.material.color.setHex(defaultColor);
};

Beam.prototype.reset = function(){
    this.force = null;
};

Beam.prototype.setForce = function(forceMag, angle){
    this.force = new THREE.Vector3(forceMag*Math.cos(angle), forceMag*Math.sin(angle), 0);
};

Beam.prototype.getForce = function(){
    return this.force;
};

Beam.prototype.getForceMagnitude = function(){
    return this.force.length();
};

Beam.prototype.getLength = function(){
    return this.vertices[0].clone().sub(this.vertices[1]).length();
};

Beam.prototype.updatePosition = function(){
    this.object3D.geometry.verticesNeedUpdate = true;
    //this.object3D.geometry.normalsNeedUpdate = true;
    //this.object3D.geometry.computeFaceNormals();
    //this.object3D.geometry.computeVertexNormals();
    this.object3D.geometry.computeBoundingSphere();
};

Beam.prototype.destroy = function(){
    this.vertices = null;
    this.object3D._myBeam = null;
    this.object3D = null;
};