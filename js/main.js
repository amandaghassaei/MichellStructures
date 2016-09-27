/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
        if (_nodes) plotNodes(_nodes, _n, _h);
    }, false);

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
        plotNodes(solveMichell(_h, _L, _n), _n, _h);
    });

    LSlider.on("slide", function(){
        _L = LSlider.slider('value');
        setUI();
        plotNodes(solveMichell(_h, _L, _n), _n, _h);
    });

    nSlider.on("slide", function(){
        _n = nSlider.slider('value');
        plotNodes(solveMichell(_h, _L, _n), _n, _h);
    });

    $("#logo").mouseenter(function(){
        $("#activeLogo").show();
    });
    $("#logo").mouseleave(function(){
        $("#activeLogo").hide();
    });

    var _nodes = solveMichell(_h, _L, _n);
    plotNodes(_nodes, _n, _h);


});
