//Inizialization
var width = window.innerWidth;
var height = window.innerHeight;
var clock = new THREE.Clock();
var scene;
var renderer;
var camera;
var pivot;
var group;
var hero;
var keyboard = new THREEx.KeyboardState();
var wRadius = 200;
var rotObjectMatrix;
var rotWorldMatrix;
//Mouse pointing
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersectPoint = new THREE.Vector3();
var x = new THREE.Vector3(1,0,0);
var y = new THREE.Vector3(0,1,0);
var z = new THREE.Vector3(0,0,1);

init();

function init() {
	createScene();
	
	update();
	//render();
}

function createScene() {
	renderer = new THREE.WebGLRenderer({antialias:true},{alpha:true});
	renderer.setSize(width,height);
	renderer.setClearColor(0xffffff,0);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene;

	//Camera
	camera = new THREE.PerspectiveCamera(45,width/height,0.1,10000);
	//camera.position.y = -60;
	//camera.position.z = 800; //490
	scene.add(camera);
	//camera.lookAt(new THREE.Vector3(0.0,0.0,0.0));
	addWorld();
	addBackground();
	addLight();
	addHero();
}

function addWorld() {
	var wSides = 80;
	var wTiers = 80;
	var wGeometry = new THREE.SphereGeometry(wRadius,wSides,wTiers);
	var wMaterial = new THREE.MeshStandardMaterial({color:0xff3333,flatShading:THREE.FlatShading});
	var vertexIndex;
	var vertexVector = new THREE.Vector3();
	var nextVertexVector = new THREE.Vector3();
	var firstVertexVector = new THREE.Vector3();
	var offset = new THREE.Vector3();
	var currentTier = 1;
	var lerpValue = 0.5;
	var heightValue;
	var maxHeight = 6;
	for (var j=1; j<wTiers-2; j++) {
		currentTier = j;
		for (var i=0; i<wSides; i++) {
			vertexIndex = (currentTier*wSides) + 1;
			vertexVector = wGeometry.vertices[i + vertexIndex].clone();
			if (j%2 !== 0) {
				if (i === 0) {
					firstVertexVector = vertexVector.clone();
				}
				nextVertexVector = wGeometry.vertices[i + vertexIndex + 1].clone();
				if (i == wSides-1) {
					nextVertexVector = firstVertexVector;
				}
				lerpValue = (Math.random()*(0.75-0.25)) - 0.25;
				vertexVector.lerp(nextVertexVector,lerpValue);
			}
			if (Math.random() > 0.8) {
				heightValue = (Math.random()*maxHeight); - (maxHeight/2);
				offset = vertexVector.clone().normalize().multiplyScalar(heightValue);
				wGeometry.vertices[i + vertexIndex] = vertexVector.add(offset);
			}
		}
	}
	rollingWorld = new THREE.Mesh(wGeometry,wMaterial);
	scene.add(rollingWorld);
}

function addHero() {
	// Create parent pivot
	var pivgeo = new THREE.CylinderGeometry(2,2,500,400);
	var pivmat = new THREE.MeshStandardMaterial({color: 0xe5f2f2,flatShading:THREE.FlatShading})
	pivot = new THREE.Mesh(pivgeo,pivmat);
	pivot.receiveShadow = true;
	//pivot.up = new THREE.Vector3(0, 0, 1);
	//pivot.lookAt(new THREE.Vector3(0, 1, 0))
	scene.add(pivot);
	// Create spaceship
	var coneGeometry = new THREE.ConeGeometry(4,15,32);
	var coneMaterial = new THREE.MeshStandardMaterial({color: 0xe5f2f2,flatShading:THREE.FlatShading})
	hero = new THREE.Mesh(coneGeometry,coneMaterial);
	hero.receiveShadow = true;
	hero.castShadow = true;
	hero.position.set(0,0,wRadius+7);

	pivot.add(hero);
	//THREE.SceneUtils.detach(hero,pivot,scene);
	//THREE.SceneUtils.attach(hero,scene,pivot);
	var pivotAxis = new THREE.AxisHelper(300); // x red y green z blue
	pivot.add(pivotAxis);
}

function addBackground() {
	var geometry  = new THREE.SphereGeometry(1000, 32, 32);
	var material  = new THREE.MeshBasicMaterial();
	material.map   = new THREE.TextureLoader().load('images/galaxy_starfield.png');
	material.side  = THREE.BackSide;
	var mesh  = new THREE.Mesh(geometry, material);

	scene.add(mesh);
}

function addLight() {
	var pointLight = new THREE.PointLight(0xf88017);
	pointLight.position.set(50,100,300);
	var pointLight2 = new THREE.PointLight(0xffff00);
	pointLight2.position.set(0,-10,-700)
	var pointLight3 = new THREE.PointLight(0x800517);
	pointLight3.position.set(-200,-60,30)
	var pointLight4 = new THREE.PointLight(0x800517);
	pointLight4.position.set(200,70,0)

	scene.add(pointLight);
	scene.add(pointLight2);
	scene.add(pointLight3);
	scene.add(pointLight4);
}

function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}
  
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

function onmousemove(event) {
  var plane = new THREE.Plane(pivot.up);//new THREE.Vector3(0, 0, 1), 0);
  //get mouse coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);//set raycaster
  raycaster.ray.intersectPlane(plane, intersectPoint); // find the point of intersection
  pivot.lookAt(intersectPoint); // face our arrow to this point
}

function update() {
	window.addEventListener("mousemove", onmousemove, false);
	delta = clock.getDelta();
	if (keyboard.pressed('w')) {
		rotateAroundObjectAxis(pivot, x, -delta)
	}
	if ( keyboard.pressed("s")) {
		rotateAroundObjectAxis(pivot, x, delta)
	}
	if (keyboard.pressed("a")) {
		rotateAroundObjectAxis(pivot, z, Math.PI/30)
	}
	if (keyboard.pressed("d")) {
		rotateAroundObjectAxis(pivot, z, -Math.PI/30)
	}
	var relativeCameraOffset = new THREE.Vector3(0,0,800);
	var cameraOffset = relativeCameraOffset.applyMatrix4( pivot.matrixWorld );
	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;
	camera.lookAt( pivot.position );
	render()
}

function render() {
	requestAnimationFrame(update);
	renderer.render(scene,camera);
}

