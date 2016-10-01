/**
 * Created by ghassaei on 9/29/16.
 */


function solveForces(beams, nodes, appliedForce){
    var forces = [];

    var currentForce = appliedForce.clone().multiplyScalar(0.5);
    for (var i=nodes.length-1;i>=0;i--){//outer layer inward
        var layerNodes = nodes[i];
        for (var j=layerNodes.length-1;j>=0;j--){
            var node = layerNodes[j];
            var nodeBeams = beams[i][j];
            var beam = nodeBeams[0];
            var angleBeam = beam.getAngle(node);
            var angleForce = Math.atan2(currentForce.y, currentForce.x);
            var angle = angleBeam-angleForce;
            var nextForce = currentForce.clone().multiplyScalar(1/Math.cos(angle));

            if (nodeBeams.length>1){

                var sideForce = currentForce.sub(nextForce);
                var sideForceLength = sideForce.length();

                forces.unshift(sideForceLength);
                forces.unshift(sideForceLength);
            }

            var sizeForce = currentForce.length();
            forces.unshift(sizeForce);
            forces.unshift(sizeForce);
        }
    }


    //_.each(beams, function(beam){
    //
    //
    //
    //
    //
    //    forces.push(beam.getLength());
    //});
    return forces;
}