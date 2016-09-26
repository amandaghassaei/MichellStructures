/**
 * Created by ghassaei on 9/26/16.
 */

function solveMichell(h, L, n) {//L = length, layers = number of layers

    if (n<1){
        console.log("n is < 1");
        return [];
    }
    if (n==1){
        return [[new THREE.Vector3(L,0,0)]];
    }
    var gamma = Math.PI/4;//gamma between 0.01 and Math.PI/2-0.01
    return binarySearchMichell(gamma, Math.PI/8, h, n, L);
}

function binarySearchMichell(gamma, stepSize, h, n, desiredLength){
    var nodes = calcMichell(gamma, h, n);
    var currentLength = getMichellLength(nodes);

    if (Math.abs(currentLength-desiredLength)<0.001) return nodes;

    if (currentLength>desiredLength) return binarySearchMichell(gamma+stepSize, stepSize/2, h, n, desiredLength);
    return binarySearchMichell(gamma-stepSize, stepSize/2, h, n, desiredLength);
}

function calcMichell(gamma, h, n){

    var nodes = [];

    var lastLayer = [new THREE.Vector3(h/(2*Math.tan(gamma/2)), 0, 0)];
    nodes.push(lastLayer);

    var supportVect = new THREE.Vector3(0, h/2, 0);

    for (var layer=2;layer<=n;layer++){

        var nextLayer = [];
        var nextVertex = solveForThirdVertex(lastLayer[0], supportVect, gamma);
        nextLayer.push(nextVertex);

        var lastVertex = nextVertex;

        for (var num=1;num<layer;num++){
            if (nextLayer.length+1 == layer){
                nextLayer.push(solveForMiddleVertex(nextLayer[nextLayer.length-1], lastLayer[lastLayer.length-1], gamma));
            } else {
                //not right, solve for intersection instead
                var vlower = lastLayer[num];
                var vupper = lastVertex;
                var vmiddle = lastLayer[num-1];

                var slopeLower = (vlower.x-vmiddle.x)/(vmiddle.y-vlower.y);
                var slopeUpper = (vmiddle.x-vupper.x)/(vupper.y-vmiddle.y);

                var x = (vupper.y-vlower.y+slopeLower*vlower.x-slopeUpper*vupper.x)/(slopeLower-slopeUpper);
                var y = slopeLower*(x-vlower.x)+vlower.y;

                nextVertex = new THREE.Vector3(x, y, 0);
                nextLayer.push(nextVertex);
                lastVertex = nextVertex;
            }
        }

        lastLayer = nextLayer;
        nodes.push(nextLayer);
    }
    return nodes;
}

function solveForMiddleVertex(v1, v2, _gamma){//angle between them is gamma/2
    return new THREE.Vector3(v2.x+(v1.clone().sub(v2).length())*(1/Math.sin(_gamma/2)), 0, 0);
}

function solveForThirdVertex(v1, v2, _gamma){//angle between them is gamma
    var d = v1.clone().sub(v2).length();
    var a = d/Math.tan(_gamma);
    var rot = Math.PI/2+Math.atan2(v1.y-v2.y, v1.x-v2.x);
    return (new THREE.Vector3(a*Math.cos(rot), a*Math.sin(rot), 0)).add(v1);
}

function getMichellLength(nodes){
    var length = 0;
    for (var i=0;i<nodes.length;i++){
        for (var j=0;j<nodes[i].length; j++){
            if (nodes[i][j].x>length) length = nodes[i][j].x;
        }
    }
    return length;
}