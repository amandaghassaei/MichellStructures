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
    this.fixed = false;
    this.externalForces = [];
    this.reset();
}

Node.prototype.setFixed = function(fixed){
    this.fixed = fixed;
};

Node.prototype.addExternalForce = function(force){
    this.externalForces.push(force);
};

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


Node.prototype.reset = function(){
    this.solved = false;
    _.each(this.beams, function(beam){
        beam.reset();
    });
};

Node.prototype.solve = function(){
    if (this.solved) return true;
    if (this.fixed) return true;
    var numUnknowns = 0;
    _.each(this.beams, function(beam){
        var beamForce = beam.getForce();
        if (beamForce == null) numUnknowns++;
    });
    if (numUnknowns>2) return false;
    var totalForces = new THREE.Vector3(0,0,0);
    _.each(this.externalForces, function(externalForce){
        totalForces.add(externalForce.getForce());
    });
    var angles = [0,0];
    var beams = [null, null];
    var self = this;
    _.each(this.beams, function(beam, i){
        var beamForce = beam.getForce();
        if (beamForce == null) {
            angles[i] = beam.getAngle(self.getPosition());
            beams[i] = beam;
        } else {
            totalForces.add(beamForce);
        }
    });
    var cos0 = Math.cos(angles[0]);
    var sin0 = Math.sin(angles[0]);
    var cos1 = Math.cos(angles[1]);
    var sin1 = Math.sin(angles[1]);
    var beam1 = (-totalForces.x+totalForces.y*cos0/sin0)/(cos1-sin1*cos0/sin0);
    var beam0 = -totalForces.y/sin0 - beam1*sin1/sin0;
    beams[0].setForce(beam0, angles[0]);
    beams[1].setForce(beam1, angles[1]);
    this.solved = true;
    return true;
};

Node.prototype.destroy = function(){
    this.object3D = null;
    this.beams = null;
};