/**
 * Created by ghassaei on 9/26/16.
 */

//storage for nodes and beams
var displayNodes = [];
var displayBeams = [];

var forces = [new Force(new THREE.Vector3(0,-20,0))];

var dashedLineMaterial = new THREE.LineDashedMaterial({color:0xebebeb, dashSize:10, gapSize:10, linewidth:3});

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
lengthLine.add(new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0xc1c1c1));
lengthLine.add(new THREE.ArrowHelper( new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,0), 1, 0xc1c1c1));
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
hLength.add(new THREE.ArrowHelper( new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0xc1c1c1));
hLength.add(new THREE.ArrowHelper( new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,0), 1, 0xc1c1c1));
hLength.children[0].line.material.linewidth = 2;
hLength.children[1].line.material.linewidth = 2;

var moj = MethodOfJoints();


//var layersObj = new THREE.Object3D();

function updateNodes(nodes, h, viewMode){

    _.each(displayNodes, function(node){
        node.move(nodes[node.getIndex()[0]][node.getIndex()[1]]);
    });

    doOtherStuff(nodes, h, viewMode);

    render();
}

function plotNodes(nodes, n, h, viewMode){

    sceneClear();

    for (var i=0;i<displayNodes.length;i++){
        displayNodes[i].destroy();
    }
    for (var i=0;i<displayBeams.length;i++){
        displayBeams[i].destroy();
    }
    displayNodes = [];
    displayBeams = [];

    var support = new Node(nodes[0][0], [0,0]);
    support.setFixed(true);
    displayNodes.push(support);
    var supportMirror = new Node(nodes[0][0], [0,0], true);
    supportMirror.setFixed(true);
    displayNodes.push(supportMirror);

    var lastLayerNodes = [];
    var lastLayerNodesMirror = [];

    for (var i=0;i<n;i++){//for each layer

        var layerVertices = nodes[i+1];

        var lastNode = support;
        var lastNodeMirror = supportMirror;

        for (var j=0;j<layerVertices.length;j++){//for each node on each layer

            var nextNode = new Node(layerVertices[j], [i+1,j]);
            displayNodes.push(nextNode);
            var beam1 = new Beam([lastNode, nextNode]);
            displayBeams.push(beam1);

            var nextNodeMirror = nextNode;
            if (j<layerVertices.length-1){
                nextNodeMirror = new Node(layerVertices[j], [i+1,j], true);
                displayNodes.push(nextNodeMirror);
            } else if (i==n-1) {//apex node
                nextNode.addExternalForce(forces[0]);
            }
            displayBeams.push(new Beam([lastNodeMirror, nextNodeMirror]));

            if (i>0 && lastLayerNodes.length>j) {
                var beam2 = new Beam([lastLayerNodes[j], nextNode]);
                displayBeams.push(beam2);
                displayBeams.push(new Beam([lastLayerNodesMirror[j], nextNodeMirror]));
            }

            if (lastLayerNodes.length>j) lastLayerNodes[j] = nextNode;
            else lastLayerNodes.push(nextNode);
            if (lastLayerNodesMirror.length>j) lastLayerNodesMirror[j] = nextNodeMirror;
            else lastLayerNodesMirror.push(nextNodeMirror);

            lastNode = nextNode;
            lastNodeMirror = nextNodeMirror;
        }
    }

    doOtherStuff(nodes, h, viewMode);

    render();
}

function colorBeams(viewMode){
    //colors
    if (viewMode == "tension-compression"){
        moj.solveForces(displayNodes);
        var forces = [];
        _.each(displayBeams, function(beam){
            forces.push(beam.getForceMagnitude());
        });
        var max = _.max(forces);
        _.each(displayBeams, function(beam, i){
            beam.setTensionCompressionColor(forces[i], max);
        });

    } else if (viewMode == "force"){
        moj.solveForces(displayNodes);

        var forces = [];
        _.each(displayBeams, function(beam){
            forces.push(beam.getForceMagnitude());
        });
        var max = _.max(forces);
        var min = _.min(forces);
        _.each(displayBeams, function(beam, i){
            beam.setColor(forces[i], max, min);
        });

    } else if (viewMode == "length"){
        var lengths = [];
        _.each(displayBeams, function(beam){
            lengths.push(beam.getLength());
        });
        var max = _.max(lengths);
        var min = _.min(lengths);
        _.each(displayBeams, function(beam, i){
            beam.setColor(lengths[i], max, min);
        });
    } else {
        //none
        _.each(displayBeams, function(beam){
            beam.setDefaultColor();
        });
    }
}

function doOtherStuff(nodes, h, viewMode){

    var widthMax = 0;
    for (var i=1;i<nodes.length;i++){
        for (var j=0;j<nodes[i].length;j++){
            if (nodes[i][j].x>widthMax) widthMax = nodes[i][j].x;
        }
    }

    colorBeams(viewMode);

    //calculate scaling
    var paddingLeft = $('#controls').width()+50;
    var paddingRight = 130;
    var scale = (window.innerWidth-(paddingLeft+paddingRight))/widthMax;
    scene.position.set((paddingRight-paddingLeft)/2,0,0);

    var arrowScale = 100;
    var lineLengthY = -(window.innerHeight/2-80)/scale;
    //lengthLine.position.y = lineLengthY;
    lengthLine.children[0].setLength(widthMax/2, widthMax/arrowScale, widthMax/arrowScale);
    lengthLine.children[1].setLength(widthMax/2, widthMax/arrowScale, widthMax/arrowScale);
    //lengthLine.scale.set(scale, scale, scale);
    minLengthLineGeo.vertices[0].set(0, -h/2, 0);
    minLengthLineGeo.vertices[1].set(0, lineLengthY, 0);
    minLengthLineGeo.verticesNeedUpdate = true;
    minLengthLineGeo.computeBoundingSphere();
    minLengthLineGeo.computeLineDistances();
    maxLengthLineGeo.vertices[0].set(widthMax, 0, 0);
    maxLengthLineGeo.vertices[1].set(widthMax, lineLengthY, 0);
    maxLengthLineGeo.verticesNeedUpdate = true;
    maxLengthLineGeo.computeBoundingSphere();
    maxLengthLineGeo.computeLineDistances();

    var hLengthX = -30/scale;
    hLength.children[0].setLength(h/2, widthMax/arrowScale, widthMax/arrowScale);
    hLength.children[1].setLength(h/2, widthMax/arrowScale, widthMax/arrowScale);
    minHGeo.vertices[0].set(0, -h/2, 0);
    minHGeo.vertices[1].set(hLengthX, -h/2, 0);
    minHGeo.verticesNeedUpdate = true;
    minHGeo.computeBoundingSphere();
    minHGeo.computeLineDistances();
    maxHGeo.vertices[0].set(0, h/2, 0);
    maxHGeo.vertices[1].set(hLengthX, h/2, 0);
    maxHGeo.verticesNeedUpdate = true;
    maxHGeo.computeBoundingSphere();
    maxHGeo.computeLineDistances();

    setScale(scale, widthMax*scale);

    lengthLine.position.set(0,lineLengthY*scale,0);
    hLength.position.x += hLengthX*scale;
}