/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
    }, false);

    var _h = 40;
    var _L = 3000;
    var _n = 5;
    var _P = new THREE.Vector3(0,0,0);

    var supportVect = new THREE.Vector3(0, _h/2, 0);

    //storage for nodes and beams
    var displayNodes = [];
    var displayBeams = [];

    var _nodes = solveMichell(_h, _L, _n);
    plotNodes(_nodes, _n);

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

    //function numNodesForN(n, val){
    //    if (val=== undefined) val = 0;
    //    val += n;
    //    if (n==1) return val;
    //    return numNodesForN(n-1, val);
    //}

    function plotNodes(nodes, n){

        var width = 0;
        var height = 0;

        for (var i=0;i<displayNodes.length;i++){
            displayNodes[i].destroy();
        }
        for (var i=0;i<displayBeams.length;i++){
            displayBeams[i].destroy();
        }
        displayNodes = [];
        displayBeams = [];

        var support = new Node(supportVect);
        var supportMirror = new Node(supportVect, true);
        displayNodes.push(support);
        displayNodes.push(supportMirror);

        var lastLayerNodes = [];
        var lastLayerNodesMirror = [];

        for (var i=0;i<n;i++){//for each layer

            var layerVertices = nodes[i];

            var lastNode = support;
            var lastNodeMirror = supportMirror;

            for (var j=0;j<layerVertices.length;j++){//for each node on each layer
                var nextNode = new Node(layerVertices[j]);
                displayNodes.push(nextNode);
                new Beam([lastNode.getPosition(), nextNode.getPosition()]);

                var nextNodeMirror = new Node(layerVertices[j], true);
                displayNodes.push(nextNodeMirror);
                new Beam([lastNodeMirror.getPosition(), nextNodeMirror.getPosition()]);

                if (i>0 && lastLayerNodes.length>j) {
                    new Beam([lastLayerNodes[j].getPosition(), nextNode.getPosition()]);
                    new Beam([lastLayerNodesMirror[j].getPosition(), nextNodeMirror.getPosition()]);
                }

                if (lastLayerNodes.length>j) lastLayerNodes[j] = nextNode;
                else lastLayerNodes.push(nextNode);
                if (lastLayerNodesMirror.length>j) lastLayerNodesMirror[j] = nextNodeMirror;
                else lastLayerNodesMirror.push(nextNodeMirror);

                var nextNodePosition = nextNode.getPosition();
                if (nextNodePosition.x > width){
                    width = nextNodePosition.x;
                }
                if (nextNodePosition.y > height){
                    height = nextNodePosition.y;
                }

                lastNode = nextNode;
                lastNodeMirror = nextNodeMirror;
            }
        }

        height *= 2;

        //calculate scaling
        var widthScale = 1;
        var padding = 100;
        if ((window.innerWidth-2*padding)<width){
            widthScale = (window.innerWidth-2*padding)/width;
        }
        var heightScale = 1;
        if ((window.innerHeight-2*padding)<height){
            heightScale = (window.innerHeight-2*padding)/height;
        }
        var scale = widthScale < heightScale ? widthScale : heightScale;

        setScale(scale);

        render();
    }

});
