/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
        if (_nodes) updateNodes(_nodes, _h, _viewMode);
    }, false);

    var $moreInfo = $("#moreInfo");

    var _h = 100;
    var _L = 1000;
    var _n = 5;
    var _scaleX = 1;
    var _scaleY = 1;
    var _P = new THREE.Vector3(0,0,0);

    var _viewMode = "force";

    setUI();

    function setUI() {
        $("#lVal").html(_L);
        $("#hVal").html(_h);
    }

    var hSlider = $("#h").slider({
        orientation: 'vertical',
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
        min: _h+1,
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

    var xScaleSlider = $("#scaleX").slider({
        orientation: 'horizontal',
        range: false,
        value: _scaleX,
        min: 0.1,
        max: 10,
        step: 0.01
    });

    var yScaleSlider = $("#scaleY").slider({
        orientation: 'horizontal',
        range: false,
        value: _scaleY,
        min: 0.1,
        max: 10,
        step: 0.01
    });

    hSlider.on("slide", function(){
        _h = hSlider.slider('value');
        LSlider.slider({
            min: _h+1
        });
        if (_h == _L) {
            _L = _h+1;//prevent unsolvable system
        }
        setUI();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, _viewMode);
    });

    LSlider.on("slide", function(){
        _L = LSlider.slider('value');
        setUI();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, _viewMode);
    });

    nSlider.on("slide", function(){
        _n = nSlider.slider('value');
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        plotNodes(_nodes, _n, _h, _viewMode);//must recalc connectivity
    });

    xScaleSlider.on("slide", function(){
        _scaleX = xScaleSlider.slider('value');
        if (_scaleX != _scaleY) $("#gammaDisplay").hide();
        else $("#gammaDisplay").show();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, _viewMode);
    });

    yScaleSlider.on("slide", function(){
        _scaleY = yScaleSlider.slider('value');
        if (_scaleX != _scaleY) $("#gammaDisplay").hide();
        else $("#gammaDisplay").show();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, _viewMode);
    });

    $("#logo").mouseenter(function(){
        $("#activeLogo").show();
    });
    $("#logo").mouseleave(function(){
        $("#activeLogo").hide();
    });

    $("input[value="+_viewMode+"]").prop("checked", true);
    $('input[name=viewMode]').on('change', function() {
        _viewMode = $('input[name=viewMode]:checked').val();
        colorBeams(_viewMode);
        render();
    });

    var $modal = $('body').modal();
    var modalAPI = $modal.data('modal');

    $('#aboutModal').click(function(e) {
        e.preventDefault();
        modalAPI.open("Sources: <a target='_blank' href='http://www.sciencedirect.com.libproxy.mit.edu/science/article/pii/S0010448514000682'>Algebraic Graph Studies</a>");
    });

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0));

    window.addEventListener( 'mousemove', mouseMove, false );
    function mouseMove(e){
        e.preventDefault();
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersections = raycaster.intersectObjects(wrapper.children);
        var highlightedObj = null;
        if (intersections.length > 0) {
            _.each(intersections, function(thing){
                if (thing.object && thing.object._myBeam){
                    thing.object._myBeam.highlight();
                    highlightedObj = thing.object._myBeam;
                }
            });
        }
        if (highlightedObj){
            if (_viewMode == "none"){

            } else {
                var val = "";
                if (_viewMode == "length"){
                    val = "Length: " + highlightedObj.getLength().toFixed(2) + " m";
                } else if (_viewMode == "force"){
                    val = "Force: " + highlightedObj.getForceMagnitude().toFixed(2) + " N";
                } else if (_viewMode == "tension-compression"){
                    var force = highlightedObj.getForceMagnitude();
                    if (highlightedObj.isInCompression()) val = "Compression: " + Math.abs(force).toFixed(2) + " N";
                    else val = "Tension: " + Math.abs(force).toFixed(2) + " N";
                }
                $moreInfo.html(val);
                $moreInfo.css({top:e.clientY-25, left:e.clientX});
                $moreInfo.show();
            }
        } else {
            _.each(displayBeams, function(beam){
                beam.unhighlight();
            });
            $moreInfo.hide();
        }
        render();
    }

    var _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
    plotNodes(_nodes, _n, _h, _viewMode);


});
