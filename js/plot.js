/**
 * Created by ghassaei on 9/26/16.
 */

//storage for nodes and beams
var displayNodes = [];
var displayBeams = [];


var dashedLineMaterial = new THREE.LineDashedMaterial({color:0x222222, dashSize:10, gapSize:10, linewidth:3});


var minLengthLineGeo = new THREE.Geometry();
minLengthLineGeo.vertices.push(new THREE.Vector3());
minLengthLineGeo.vertices.push(new THREE.Vector3());
minLengthLineGeo.dynamic = true;
var minLengthLine = new THREE.Line(minLengthLineGeo, dashedLineMaterial);
scene.add(minLengthLine);
var maxLengthLineGeo = new THREE.Geometry();
maxLengthLineGeo.vertices.push(new THREE.Vector3());
maxLengthLineGeo.vertices.push(new THREE.Vector3());
maxLengthLineGeo.dynamic = true;
var maxLengthLine = new THREE.Line(maxLengthLineGeo, dashedLineMaterial);
scene.add(maxLengthLine);
var lengthLine = new THREE.Object3D();
scene.add(lengthLine);
lengthLine.add(new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0x000000));
lengthLine.add(new THREE.ArrowHelper( new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,0), 1, 0x000000));
lengthLine.children[0].line.material.linewidth = 2;
lengthLine.children[1].line.material.linewidth = 2;

var minHGeo = new THREE.Geometry();
minHGeo.vertices.push(new THREE.Vector3());
minHGeo.vertices.push(new THREE.Vector3());
minHGeo.dynamic = true;
var minH = new THREE.Line(minHGeo, dashedLineMaterial);
scene.add(minH);
var maxHGeo = new THREE.Geometry();
maxHGeo.vertices.push(new THREE.Vector3());
maxHGeo.vertices.push(new THREE.Vector3());
maxHGeo.dynamic = true;
var maxH = new THREE.Line(maxHGeo, dashedLineMaterial);
scene.add(maxH);
var hLength = new THREE.Object3D();
scene.add(hLength);
hLength.add(new THREE.ArrowHelper( new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0x000000));
hLength.add(new THREE.ArrowHelper( new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,0), 1, 0x000000));
hLength.children[0].line.material.linewidth = 2;
hLength.children[1].line.material.linewidth = 2;

//var layersObj = new THREE.Object3D();



function plotNodes(nodes, n, h){

    var widthMin = 0;
    var widthMax = 0;
    var height = 0;

    sceneClear();

    for (var i=0;i<displayNodes.length;i++){
        displayNodes[i].destroy();
    }
    for (var i=0;i<displayBeams.length;i++){
        displayBeams[i].destroy();
    }
    displayNodes = [];
    displayBeams = [];

    var supportVect = new THREE.Vector3(0, h/2, 0);

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
            if (nextNodePosition.x > widthMax){
                widthMax = nextNodePosition.x;
            }
            if (nextNodePosition.x < widthMin){
                widthMin = nextNodePosition.x;
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
    var padding = 130;
    var scale = (window.innerWidth-2*padding)/widthMax;

    var arrowScale = 100;
    var lineLengthY = -(window.innerHeight/2-80)/scale;
    //lengthLine.position.y = lineLengthY;
    lengthLine.children[0].setLength(widthMax/2, widthMax/arrowScale, widthMax/arrowScale);
    lengthLine.children[1].setLength(widthMax/2, widthMax/arrowScale, widthMax/arrowScale);
    //lengthLine.scale.set(scale, scale, scale);
    minLengthLineGeo.vertices[0].set(0, -h/2, 0);
    minLengthLineGeo.vertices[1].set(0, lineLengthY, 0);
    minLengthLineGeo.verticesNeedUpdate = true;
    minLengthLineGeo.computeLineDistances();
    maxLengthLineGeo.vertices[0].set(widthMax, 0, 0);
    maxLengthLineGeo.vertices[1].set(widthMax, lineLengthY, 0);
    maxLengthLineGeo.verticesNeedUpdate = true;
    maxLengthLineGeo.computeLineDistances();

    var hLengthX = -30/scale;
    hLength.children[0].setLength(h/2, widthMax/arrowScale, widthMax/arrowScale);
    hLength.children[1].setLength(h/2, widthMax/arrowScale, widthMax/arrowScale);
    minHGeo.vertices[0].set(0, -h/2, 0);
    minHGeo.vertices[1].set(hLengthX, -h/2, 0);
    minHGeo.verticesNeedUpdate = true;
    minHGeo.computeLineDistances();
    maxHGeo.vertices[0].set(0, h/2, 0);
    maxHGeo.vertices[1].set(hLengthX, h/2, 0);
    maxHGeo.verticesNeedUpdate = true;
    maxHGeo.computeLineDistances();

    setScale(scale, widthMax*scale);

    lengthLine.position.set(0,lineLengthY*scale,0);
    hLength.position.x += hLengthX*scale;

    render();
}