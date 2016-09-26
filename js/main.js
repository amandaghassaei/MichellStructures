/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
    }, false);

    var _h = 100;
    var _L = 1000;
    var _n = 5;
    var _P = new THREE.Vector3(0,0,0);

    var hSlider = $("#h").slider({
        orientation: 'horizontal',
        range: false,
        value: _h,
        min: 1,
        max: 1000,
        step: 1
    });

    var LSlider = $("#L").slider({
        orientation: 'horizontal',
        range: false,
        value: _L,
        min: 1,
        max: 10000,
        step: 1
    });

    var nSlider = $("#n").slider({
        orientation: 'horizontal',
        range: false,
        value: _n,
        min: 1,
        max: 20,
        step: 1
    });

    hSlider.on("slide", function(){
        _h = hSlider.slider('value');
        plotNodes(solveMichell(_h, _L, _n), _n);
    });

    LSlider.on("slide", function(){
        _L = LSlider.slider('value');
        plotNodes(solveMichell(_h, _L, _n), _n);
    });

    nSlider.on("slide", function(){
        _n = nSlider.slider('value');
        plotNodes(solveMichell(_h, _L, _n), _n);
    });


    //storage for nodes and beams
    var displayNodes = [];
    var displayBeams = [];

    var _nodes = solveMichell(_h, _L, _n);
    plotNodes(_nodes, _n);

    function plotNodes(nodes, n){

        var width = 0;
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

        var supportVect = new THREE.Vector3(0, _h/2, 0);

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

        setScale(scale, width);

        render();
    }

});
