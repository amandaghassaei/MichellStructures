/**
 * Created by ghassaei on 9/16/16.
 */

//var beamMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});


function Beam(nodes){

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = nodes;
    var material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});

    this.vertices = nodes;
    this.object3D = new THREE.Line(lineGeometry, material);
    this.object3D._myBeam = this;
    sceneAdd(this.object3D);
}

Beam.prototype.highlight = function(){



    //this.line.geometryNeed = true;
};

Beam.prototype.unhighlight = function(){

};

Beam.prototype.getAngle = function(fromNode){
    var node2 = this.vertices[0];
    if (node2.equals(fromNode)) node2 = this.vertices[1];
    return Math.atan2(node2.y-fromNode.y, node2.x-fromNode.x);
};

Beam.prototype.setForce = function(force, max, min){
    this.force = force;
    var scaledVal = (1-(force - min)/(max - min)) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.getForce = function(){
    return this.force;
};

Beam.prototype.getLength = function(){
    return this.vertices[0].clone().sub(this.vertices[1]).length();
};

Beam.prototype.destroy = function(){
    this.vertices = null;
    this.object3D = null;
};