/**
 * Created by ghassaei on 9/16/16.
 */

var isDragging = false;
var isDraggingArrow = false;

$(function() {

    initThreeJS();

    window.addEventListener('resize', function(){
        onWindowResizeThree();
        if (_nodes) updateNodes(_nodes, _h, window.viewMode);
    }, false);

    var $moreInfo = $("#moreInfo");

    var _h = 16;
    var _L = 40;
    var _n = 5;
    var _scaleX = 1;
    var _scaleY = 1;

    initPlot();

    $("#xForce").change(function(){
        var val = $("#xForce").val();
        if (isNaN(parseFloat(val))) return;
        val = parseFloat(val);
        if (val > 1) val = 1;
        if (val < -1) val = -1;
        var y = Math.sqrt(1-val*val);
        if (parseFloat($("#yForce").val()) < 0) y *= -1;
        forces[0].setDirection(val, y);
        updateNodes(_nodes, _h, window.viewMode);
    });
    $("#yForce").change(function(){
        var val = $("#yForce").val();
        if (isNaN(parseFloat(val))) return;
        val = parseFloat(val);
        if (val > 1) val = 1;
        if (val < -1) val = -1;
        var x = Math.sqrt(1-val*val);
        if (parseFloat($("#xForce").val()) < 0) x *= -1;
        forces[0].setDirection(x, val);
        updateNodes(_nodes, _h, window.viewMode);
    });

    $("#magForce").change(function(){
        var val = $("#magForce").val();
        if (isNaN(parseFloat(val))) return;
        val = parseFloat(val);
        if (val < 0) val = 0;
        forces[0].setMagnitude(val);
        updateNodes(_nodes, _h, window.viewMode);
    });

    window.viewMode = "force";

    $("#about").click(function(e){
        e.preventDefault();
        $('#aboutModal').modal('show')
    });

    var hSlider = $("#h").slider({
        orientation: 'vertical',
        range: false,
        value: _h,
        min: 1,
        max: 100,
        step: 1
    });

    var LSlider = $("#L").slider({
        orientation: 'horizontal',
        range: false,
        value: _L,
        min: 1,
        max: 300,
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

    setSliderInput(hSlider, "hValInput", function(){
        _h = hSlider.slider('value');
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, window.viewMode);
    });

    setSliderInput(LSlider, "lValInput", function(){
        _L = LSlider.slider('value');
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, window.viewMode);
    });

    setSliderInput(nSlider, "nInput", function(){
        _n = nSlider.slider('value');
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        plotNodes(_nodes, _n, _h, window.viewMode);//must recalc connectivity
    });

    $("#gammaPrescaled").hide();
    setSliderInput(xScaleSlider, "xScaleInput", function(){
        _scaleX = xScaleSlider.slider('value');
        if (_scaleX != _scaleY) $("#gammaPrescaled").show();
        else $("#gammaPrescaled").hide();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, window.viewMode);
    });

    setSliderInput(yScaleSlider, "yScaleInput", function(){
        _scaleY = yScaleSlider.slider('value');
       if (_scaleX != _scaleY) $("#gammaPrescaled").show();
        else $("#gammaPrescaled").hide();
        _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
        updateNodes(_nodes, _h, window.viewMode);
    });


    $("#logo").mouseenter(function(){
        $("#activeLogo").show();
    });
    $("#logo").mouseleave(function(){
        $("#activeLogo").hide();
    });

    $("input[value="+window.viewMode+"]").prop("checked", true);
    $('input[name=viewMode]').on('change', function() {
        window.viewMode = $('input[name=viewMode]:checked').val();
        colorBeams(window.viewMode);
        render();
    });

    var scaleHTML = "";
    for (var i=0;i<=20;i++){
        scaleHTML += "<div>";
        scaleHTML += "<div id='swatch" + i + "' class='colorSwatch'></div>";
        if (i%5 == 0) scaleHTML += "<span id='label" + i + "'></span>";
        scaleHTML += "</div>";
    }
    $("#rainbow").html(scaleHTML);

    var scaleHTML = "";
    for (var i=0;i<=20;i++){
        scaleHTML += "<div>";
        scaleHTML += "<div id='tension" + i + "' class='colorSwatch'></div>";
        scaleHTML += "<div id='compression" + i + "' class='colorSwatch'></div>";
        if (i%5 == 0) scaleHTML += "<span id='labelCT" + i + "'></span>";
        scaleHTML += "</div>";
    }
    $("#tension-compressionScale").html(scaleHTML);

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    window.addEventListener('mousedown', function(){
        isDragging = true;
    }, false);
    window.addEventListener('mouseup', function(){
        isDragging = false;
        isDraggingArrow = false;
    }, false);

    function dragArrow(e){
        var intersection = raycaster.intersectObject(deactivatePlane);
        forces[0].move(intersection[0].point);
        updateNodes(_nodes, _h, window.viewMode);
        $moreInfo.hide();
    }

    window.addEventListener( 'mousemove', mouseMove, false );
    function mouseMove(e){
        e.preventDefault();
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (isDraggingArrow && e.which == 1){
            dragArrow(e);
        } else {

            var intersections = raycaster.intersectObjects(wrapper.children.concat([forces[0].arrow.cone]));
            var highlightedObj = null;
            if (intersections.length > 0) {
                _.each(intersections, function (thing) {
                    if (thing.object && thing.object._myBeam) {
                        thing.object._myBeam.highlight();
                        highlightedObj = thing.object._myBeam;
                    } else if (thing.object && thing.object._myForce) {
                        thing.object._myForce.highlight();
                        highlightedObj = thing.object._myForce;
                    }
                });
            }
            if (highlightedObj) {
                if (highlightedObj.getMagnitude) {
                    //force
                    var val = "Applied Force: " + highlightedObj.getMagnitude().toFixed(2) + " N";
                    $moreInfo.html(val);
                    $moreInfo.css({top: e.clientY - 40, left: e.clientX});
                    $moreInfo.show();
                    if (isDragging) {
                        isDraggingArrow = true;
                        dragArrow(e);
                    }
                } else {
                    if (window.viewMode == "none") {

                    } else {
                        var val = "";
                        if (window.viewMode == "length") {
                            val = "Length: " + highlightedObj.getLength().toFixed(2) + " m";
                        } else if (window.viewMode == "force") {
                            val = "Force: " + highlightedObj.getForceMagnitude().toFixed(2) + " N";
                        } else if (window.viewMode == "tension-compression") {
                            var force = highlightedObj.getForceMagnitude();
                            if (highlightedObj.isInCompression()) val = "Compression: " + Math.abs(force).toFixed(2) + " N";
                            else val = "Tension: " + Math.abs(force).toFixed(2) + " N";
                        } else if (window.viewMode == "FL"){
                            val = "F x L: " + (highlightedObj.getForceMagnitude()*highlightedObj.getLength()).toFixed(2) + " Nm";
                        }
                        $moreInfo.html(val);
                        $moreInfo.css({top: e.clientY - 40, left: e.clientX});
                        $moreInfo.show();
                    }
                }
            } else {
                _.each(displayBeams, function (beam) {
                    beam.unhighlight();//todo wrong place?
                });
                _.each(forces, function(force){
                    force.unhighlight();
                });
                $moreInfo.hide();
            }
        }
        render();
    }

    var _nodes = solveMichell(_h, _L, _n, _scaleX, _scaleY);
    plotNodes(_nodes, _n, _h, window.viewMode);

});

function setSliderInput(sliderEl, id, callback){
    var $input = $("#" + id);
    $("input#" + id).change(function(){
        //sliderEl.slide();
        var val = $input.val();
        if ($input.hasClass("int")){
            if (isNaN(parseInt(val))) return;
            val = parseInt(val);
        } else {
            if (isNaN(parseFloat(val))) return;
            val = parseFloat(val);
        }

        var min = sliderEl.slider("option", "min");
        if (val <= 0) val = min;
        $input.val(val);
        sliderEl.slider('value', val);
        callback();
    });
    $input.val(sliderEl.slider('value'));
    sliderEl.on("slide", function(){
        $input.val(sliderEl.slider('value'));
        //need this for some reason
        isDragging = false;
        isDraggingArrow = false;
        callback();
    });
}
