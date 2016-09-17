/**
 * Created by ghassaei on 9/16/16.
 */

var beamMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});

function Beam(nodes){

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = nodes;

    this.line = new THREE.Line(lineGeometry, beamMaterial);
    sceneAdd(this.line);
}

Beam.prototype.update = function(){
    //this.line.geometryNeed = true;
};

Beam.prototype.destroy = function(){
    sceneRemove(this.line);
    this.object3D = null;
};