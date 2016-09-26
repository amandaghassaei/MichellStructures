/**
 * Created by ghassaei on 9/16/16.
 */

//var beamMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});

function Beam(nodes){

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = nodes;
    var material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});

    this.line = new THREE.Line(lineGeometry, material);
    sceneAdd(this.line);
}

Beam.prototype.update = function(){
    //this.line.geometryNeed = true;
};

Beam.prototype.destroy = function(){
    this.object3D = null;
};