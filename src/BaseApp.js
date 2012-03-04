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

