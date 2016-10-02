/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
        if (_nodes) plotNodes(_nodes, _n, _h);
    }, false);

    var $moreInfo = $("#moreInfo");

    var _h = 100;
    var _L = 1000;
    var _n = 5;
    var _P = new THREE.Vector3(0,0,0);

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

    hSlider.on("slide", function(){
        _h = hSlider.slider('value');
        LSlider.slider({
            min: _h+1
        });
        if (_h == _L) {
            _L = _h+1;//prevent unsolvable system
        }
        setUI();
        _nodes = solveMichell(_h, _L, _n);
        updateNodes(_nodes);
    });

    LSlider.on("slide", function(){
        _L = LSlider.slider('value');
        setUI();
        _nodes = solveMichell(_h, _L, _n);
        updateNodes(_nodes);
    });

    nSlider.on("slide", function(){
        _n = nSlider.slider('value');
        _nodes = solveMichell(_h, _L, _n);
        plotNodes(_nodes, _n);//must recalc connectivity
    });

    $("#logo").mouseenter(function(){
        $("#activeLogo").show();
    });
    $("#logo").mouseleave(function(){
        $("#activeLogo").hide();
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
            $moreInfo.html(highlightedObj.getForce().toFixed(2));
            $moreInfo.css({top:e.clientY-25, left:e.clientX});
            $moreInfo.show();
        } else {
            _.each(displayBeams, function(beam){
                beam.unhighlight();
            });
            $moreInfo.hide();
        }
        render();
    }

    var _nodes = solveMichell(_h, _L, _n);
    plotNodes(_nodes, _n, _h);


});
