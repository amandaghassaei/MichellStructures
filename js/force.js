/**
 * Created by ghassaei on 10/2/16.
 */


function Force(force){
    this.setForce(force);
    this.arrow = new THREE.ArrowHelper(this.getDirection(), new THREE.Vector3(0,0,0), this.getMagnitude(), 0xaaaaaa);//0xaaaaaa
    this.arrow.setLength(this.getMagnitude(), 3, 3);
    this.arrow.line.material.linewidth = 4;
    this.arrow.cone._myForce = this;
    scene.add(this.arrow);
}

Force.prototype.setForce = function(force){
    this.force = force;
    $("#magForce").val(this.getMagnitude().toFixed(2));
    var direction = this.getDirection();
    $("#xForce").val(direction.x.toFixed(2));
    $("#yForce").val(direction.y.toFixed(2));
};

Force.prototype.getMagnitude = function(){
    return this.force.length();
};

Force.prototype.setMagnitude = function(magnitude){
    this.setForce(this.getDirection().multiplyScalar(magnitude));
};

Force.prototype.getDirection = function(){
    return this.force.clone().normalize();
};

Force.prototype.setDirection = function(x, y){
    var unitVector = new THREE.Vector3(x,y,0);
    this.arrow.setDirection(unitVector);
    this.setForce(unitVector.clone().multiplyScalar(this.getMagnitude()));
};

Force.prototype.getForce = function(){
    return this.force.clone();
};

Force.prototype.highlight = function(){
    this.arrow.line.material.color.setHex(0x000000);
    this.arrow.cone.material.color.setHex(0x000000);
};

Force.prototype.unhighlight = function(){
    this.arrow.line.material.color.setHex(0xaaaaaa);
    this.arrow.cone.material.color.setHex(0xaaaaaa);
};

Force.prototype.render = function(position, scale){
    this.arrow.position.set(position*scale/2, 0, 0.1);
    this.arrow.setDirection(this.getDirection());
    this.arrow.setLength(3*this.getMagnitude()/scale, 10/scale, 10/scale);
};

Force.prototype.move = function(intersection){
    console.log(intersection.x);
    var force = new THREE.Vector3((intersection.x-85)*20/55, (intersection.y-20)*20/55, 0);
    this.setForce(force);
};

Force.prototype.destroy = function(){
    this.arrow.cone._myForce = null;
    scene.remove(this.arrow);
    this.arrow = null;
};