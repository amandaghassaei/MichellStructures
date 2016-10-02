/**
 * Created by ghassaei on 10/2/16.
 */


function Force(force){
    this.force = force;
}

Force.prototype.getMagnitude = function(){
    this.force.length();
};

Force.prototype.getDirection = function(){
    return this.force.clone().normalize();
};

Force.prototype.getForce = function(){
    return this.force.clone();
};

Force.prototype.change = function(force){
    this.force = force;
};