// include required files
/** @namespace LAB*/
var LAB = LAB || {};

// reference to global context, in most cases 'window'.
LAB.global = this;

var gl;
var labself;

var BaseApp = function(){
//   if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
   labself = this;
      
//   this.init();
//   this.animate();
}

BaseApp.prototype.init = function()
{
	this.startTime = Date.now();
	this.elapsedTime 	= 0;
   
   this.scene = new THREE.Scene();
   
   this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
   this.scene.add( this.camera );
   
   this.renderer = new THREE.WebGLRenderer( { antialias: true } );
   this.renderer.setSize( window.innerWidth, window.innerHeight );
	
   if (document.getElementById("container") != null){
      this.container = document.getElementById("container");
   } else {
      console.log("no container in document, generating container div")
      this.container = document.createElement( 'div' );
      if (document.body)
         document.body.appendChild( this.container );
      else
         return;
   }
   
   this.container.appendChild(this.renderer.domElement);
	gl = gl || this.renderer.getContext();

   this.setup();
   console.log( 'init base app' );
}


BaseApp.prototype.setup = function(){
   console.log( "BaseApp: setup ...override to extend" );
}

BaseApp.prototype.update = function(){
   //override to extending
//   console.log( "BaseApp: updated ...override to extend" );
}


BaseApp.prototype.draw = function(){
   //override to extending
}

BaseApp.prototype.animate = function(){
   //   requestAnimationFrame( animate );
   //   this.update();
   //   this.draw();
   
	requestAnimationFrame( labself.animate, this );
   this.elapsedTime = Date.now() - this.startTime;
   
	labself.update();
	labself.draw();
}

BaseApp.prototype.getElapsedTimeMillis	= function()
{
   return this.elapsedTime;
}

BaseApp.prototype.getElapsedTimeSeconds = function(){
   return this.elapsedTime/1000;
}



randomRange = function( _min, _max){
   return Math.random() * ( _max - _min ) + _min;
}
/**
 @function
 */
randomInt	= function( _min, _max) {
   return Math.floor( randomRange( _min, _max ));
}
/**
 @function
 */
randomObject  	= function( _array ){
   return _array[ Math.min(randomInt(0, _array.length ), _array.length-1)];
}
/**
 @function
 */
BaseApp.prototype.map	= function(value, _oldMin, _oldMax, _min, _max){    
   return _min + ((value-_oldMin)/(_oldMax-_oldMin)) * (_max-_min);
}
/**
 @function
 */
BaseApp.prototype.clamp	= function( value, _min, _max ){
   return Math.min( Math.max( value, _min), _max );
}

/**
 @function
 */
BaseApp.prototype.degToRad		= function( deg ){
   return deg * 0.0174532925;
}
/**
 @function
 */
BaseApp.prototype.radToDeg		= function( rad ){
   return rad * 57.2957795;
}



//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
//
//var container, stats;
//
//var camera, scene, renderer;
//
//init();
//animate();
//
//function init() {
//   
//   container = document.createElement( 'div' );
//   document.body.appendChild( container );
//   
//   scene = new THREE.Scene();
//   
//   camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
//   camera.position.y = 400;
//   scene.add( camera );
//   
//   var light, object, materials;
//   
//   scene.add( new THREE.AmbientLight( 0x404040 ) );
//   
//   light = new THREE.DirectionalLight( 0xffffff );
//   light.position.set( 0, 0, 1 );
//   scene.add( light );
//   
//   materials = [
//   new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb, map: THREE.ImageUtils.loadTexture( 'textures/ash_uvgrid01.jpg' ) } ),
//   new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 } )
//   ];
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( 100, 100, 100, 4, 4, 4 ), materials );
//   object.position.set( -200, 0, 400 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), materials );
//   object.position.set( 0, 0, 400 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.IcosahedronGeometry( 75, 1 ), materials );
//   object.position.set( -200, 0, 200 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.OctahedronGeometry( 75, 2 ), materials );
//   object.position.set( 0, 0, 200 );
//   scene.add( object );
//   
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.TetrahedronGeometry( 75, 0 ), materials );
//   object.position.set( 200, 0, 200 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.PlaneGeometry( 100, 100, 4, 4 ), materials );
//   object.children[ 0 ].doubleSided = true;
//   object.position.set( -200, 0, 0 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.SphereGeometry( 75, 20, 10 ), materials );
//   object.position.set( 0, 0, 0 );
//   scene.add( object );
//   
//   var points = [];
//   
//   for ( var i = 0; i < 50; i ++ ) {
//      
//      points.push( new THREE.Vector3( Math.sin( i * 0.2 ) * 15 + 50, 0, ( i - 5 ) * 2 ) );
//      
//   }
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.LatheGeometry( points, 20 ), materials );
//   object.children[ 0 ].doubleSided = true;
//   object.position.set( 200, 0, 0 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.TorusGeometry( 50, 20, 20, 20 ), materials );
//   object.position.set( -200, 0, -200 );
//   scene.add( object );
//   
//   object = THREE.SceneUtils.createMultiMaterialObject( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), materials );
//   object.position.set( 0, 0, -200 );
//   scene.add( object );
//   
//   object = new THREE.AxisHelper();
//   object.position.set( 200, 0, -200 );
//   object.scale.x = object.scale.y = object.scale.z = 0.5;
//   scene.add( object );
//   
//   renderer = new THREE.WebGLRenderer( { antialias: true } );
//   renderer.setSize( window.innerWidth, window.innerHeight );
//   
//   container.appendChild( renderer.domElement );
//   
//   stats = new Stats();
//   stats.domElement.style.position = 'absolute';
//   stats.domElement.style.top = '0px';
//   container.appendChild( stats.domElement );
//   
//}
//
////
//
//function animate() {
//   
//   requestAnimationFrame( animate );
//   
//   render();
//   stats.update();
//   
//}

//function render() {
//   
//   var timer = Date.now() * 0.0001;
//   
//   camera.position.x = Math.cos( timer ) * 800;
//   camera.position.z = Math.sin( timer ) * 800;
//   
//   camera.lookAt( scene.position );
//   
//   for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
//      
//      var object = scene.children[ i ];
//      
//      object.rotation.x += 0.01;
//      object.rotation.y += 0.005;
//      
//   }
//   
//   renderer.render( scene, camera );
//   
//}

