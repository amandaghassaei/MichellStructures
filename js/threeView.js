/**
 * Created by ghassaei on 9/16/16.
 */

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

function initThreeJS(){

    renderer.setSize( window.innerWidth, window.innerHeight );
    $("#threeDiv").append(renderer.domElement);

    scene.background = new THREE.Color( 0xffffff );

    camera.position.z = 100;
}

function render(){
    renderer.render(scene, camera);
}

function sceneAdd(object){
    scene.add(object);
}

function sceneRemove(object){
    scene.remove(object);
}