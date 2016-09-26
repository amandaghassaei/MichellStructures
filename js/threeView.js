/**
 * Created by ghassaei on 9/16/16.
 */

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});

var wrapper = new THREE.Object3D();//object to set global scale and position

function initThreeJS(){

    renderer.setSize( window.innerWidth, window.innerHeight );
    $("#threeDiv").append(renderer.domElement);

    scene.background = new THREE.Color( 0xffffff );

    camera.zoom = 1;
    camera.updateProjectionMatrix();
    camera.position.z = 400;

    scene.add(wrapper);
}

function render(){
    renderer.render(scene, camera);
}

function sceneAdd(object){
    wrapper.add(object);
}

function sceneClear(){
    wrapper.children = [];
}

function setScale(scale, width){
    wrapper.scale.set(scale, scale, scale);
    wrapper.position.x = -width/2;
}

function onWindowResizeThree() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}