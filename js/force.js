/**
 * Created by ghassaei on 10/2/16.
 */


function Force(force){
    this.force = force;
    this.arrow = new THREE.ArrowHelper(this.getDirection(), new THREE.Vector3(0,0,0), this.getMagnitude(), 0xaaaaaa);
    this.arrow.setLength(this.getMagnitude(), 3, 3);
    this.arrow.line.material.linewidth = 4;
    this.arrow.cone._myForce = this;
    scene.add(this.arrow);
}

Force.prototype.getMagnitude = function(){
    return this.force.length();
};

Force.prototype.getDirection = function(){
    return this.force.clone().normalize();
};

Force.prototype.getForce = function(){
    return this.force.clone();
};

Force.prototype.render = function(position, scale){
    this.arrow.position.set(position*scale/2, 0, 0.1);
    this.arrow.setLength(3*this.getMagnitude()/scale, 10/scale, 10/scale);
};

Force.prototype.change = function(force){
    this.force = force;
    this.arrow.setDirection(this.getDirection());
    this.arrow.setLength(this.getMagnitude());
};

Force.prototype.destroy = function(){
    this.arrow.cone._myForce = null;
    scene.remove(this.arrow);
    this.arrow = null;
};