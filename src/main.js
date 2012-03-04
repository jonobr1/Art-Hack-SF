
var testApp = new BaseApp();

//

var bStats =  true;
var camera;
var geo;
var emitter;
var count = 0;
var currentTime = 0;
var vectorTrails = [];
var vectorMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1.0, linewidth: 2 });

var Worm = function( parameters ){
   parameters = parameters || {};
   
   this.vel = parameters.vel || new THREE.Vector3( randomRange(-.1, .1), randomRange(-.1, .1), randomRange(-.1, .1) );
   this.speed = 5;
   
   this.geometry = parameters.geometry || new THREE.Geometry();
   //   this.generateGeometry();
   for(var i=0; i<50; i++){
      this.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3()));
   }
   this.geometry.dynamic = true;
   
   this.material = parameters.material || new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1.0, linewidth: 2 });

  this.depthMaterial = parameters.material || new THREE.MeshDepthMaterial();
	this.depthMaterial.linewidth = 2;
//	this.depthMaterial.linecap = 'round';
//	this.depthMaterial.linejoin = 'round';
//   this.material.vertexColors = true;
   
   this.mesh = new THREE.Line(this.geometry, this.depthMaterial);
//   this.mesh.position = position.clone();
   

                            
   this.update = function( offset ){
      offset = offset || 0;
      for(var i=this.geometry.vertices.length-1; i>=1; i--){
         this.geometry.vertices[i].position.multiplyScalar(.6);
         this.geometry.vertices[i].position.x += this.geometry.vertices[i-1].position.x *.4;
         this.geometry.vertices[i].position.y += this.geometry.vertices[i-1].position.y *.4;
         this.geometry.vertices[i].position.z += this.geometry.vertices[i-1].position.z *.4;
      }
      
      var n, nx, ny, nz;
      var nOffset = .1;
      var nScl = .25;
      var attenuation = .75;
      var p = this.geometry.vertices[0].position;
      n = noise( p.x, p.y, p.z );
      nx = n - noise( p.x+nOffset + currentTime + offset, p.y, p.z );
      ny = n - noise( p.x, p.y+nOffset + currentTime + offset, p.z );
      nz = n - noise( p.x, p.y, p.z+nOffset + currentTime + offset );
      
      this.geometry.vertices[0].position.addSelf( this.vel );
      this.geometry.vertices[0].position.addSelf( {x: nx, y: ny, z: nx });
      this.geometry.__dirtyVertices = true;
   }
}

var worms = [];
testApp.initPostprocessing = function() {
    var postUniforms = {
    "time": { type: "f", value: 0 },
    "samplerSphere": { type: "fv", value: [0.000000,0.000000,-1.000000,0.000000,0.525731,-0.850651,0.500000,0.162460,-0.850651,0.000000,0.894427,-0.447213,0.500000,0.688191,-0.525731,0.850651,0.276394,-0.447213,0.309017,-0.425325,-0.850651,0.809017,-0.262865,-0.525731,0.525731,-0.723607,-0.447213,-0.309017,-0.425325,-0.850651,0.000000,-0.850651,-0.525731,-0.525731,-0.723607,-0.447213,-0.500000,0.162460,-0.850651,-0.809017,-0.262865,-0.525731,-0.850651,0.276394,-0.447213,-0.500000,0.688191,-0.525731,-0.309017,0.951057,0.000000,-0.809017,0.587785,0.000000,-0.525731,0.723607,0.447213,-1.000000,0.000000,0.000000,-0.809017,-0.587785,0.000000,-0.850651,-0.276394,0.447213,-0.309017,-0.951057,0.000000,0.309017,-0.951057,0.000000,0.000000,-0.894427,0.447213,0.809017,-0.587785,0.000000,1.000000,0.000000,0.000000,0.850651,-0.276394,0.447213,0.809017,0.587785,0.000000,0.309017,0.951057,0.000000,0.525731,0.723607,0.447213,0.000000,0.850651,0.525731,-0.809017,0.262865,0.525731,-0.500000,-0.688191,0.525731,0.500000,-0.688191,0.525731,0.809017,0.262865,0.525731,0.000000,0.000000,1.000000,0.309017,0.425325,0.850651,-0.309017,0.425325,0.850651,0.500000,-0.162460,0.850651,0.000000,-0.525731,0.850651,-0.500000,-0.162460,0.850651]},
    "samplerBokehHex": { type: "fv", value: [0.500000,0.000000,0.866025,0.166667,0.000000,0.866025,-0.166667,0.000000,0.866025,-0.500000,0.000000,0.866025,-0.666667,0.000000,0.577350,-0.833333,0.000000,0.288675,-1.000000,0.000000,0.000000,-0.833333,0.000000,-0.288675,-0.666667,0.000000,-0.577350,-0.500000,0.000000,-0.866025,-0.166667,0.000000,-0.866025,0.166667,0.000000,-0.866025,0.500000,0.000000,-0.866025,0.666667,0.000000,-0.577350,0.833333,0.000000,-0.288675,1.000000,0.000000,0.000000,0.833333,0.000000,0.288675,0.666667,0.000000,0.577350]},
    "tColor": { type: "t", value: 0, texture: this.renderTarget.color },

    "dof":    { type: "f", value: 1.0 },
    "focus":    { type: "f", value: 0.56 },
		"aspect":   { type: "f", value: window.innerWidth/window.innerHeight },
		"maxblur":  { type: "f", value: 0.0025 },
      
		"vignette":  { type: "f", value: 1.0 },
    "screenWidth": { type: "f", value:window.innerWidth },
		"screenHeight": { type: "f", value:window.innerHeight },
		"vingenettingDarkening": { type: "f", value: 0.1 },
      
		"colorA": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		"colorB": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		"colorC": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

    };

    this.postMaterial = new THREE.MeshShaderMaterial( {

        uniforms: postUniforms,
        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = vec2( uv.x, 1.0 - uv.y );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

        "uniform sampler2D tColor;",
        "uniform sampler2D tDepth;",
        "uniform sampler2D tNoise;",
        "uniform sampler2D tNormal;",

        "uniform float maxblur;",  	// max blur amount
        "uniform float aperture;",	// aperture - bigger values for shallower depth of field
        "uniform float dof;",
        "uniform float ssao;",
        "uniform float ssaoRad;",
        "uniform vec3 samplerBokehHex[18];",
        "uniform vec3 samplerSphere[42];",
        "uniform float focus;",
        "uniform float aspect;",
        "uniform float vignette;",

				"uniform float screenWidth;",
				"uniform float screenHeight;",
				"uniform float vingenettingDarkening;",

				"varying vec2 vUv;",

				"void main() {",

					"vec4 col = texture2D( tColor, vUv.xy );",
          "if (col.a == 0.) col.rgb = vec3(0.5);",

          "float ao = (1.0);",
          "vec3 rndUv = vec3(0.0);",

          "if (dof == 1.0) {",

            "col = vec4(0.);",
            "vec2 aspectcorrect = vec2( 1.0, aspect );",
            "for( int i=1; i<18; i++ ){",
              "vec2 st = vUv - vec2(0.5);",
              "float dist = sqrt(st.s*st.s+st.t*st.t/aspect);",
              "rndUv.xy = vUv + (dist*maxblur*samplerBokehHex[i].xz*aspectcorrect);",
              "col += texture2D( tColor, rndUv.xy );",
            "}",
            "gl_FragColor = col/18.;",
            "gl_FragColor.rgb *= 1./gl_FragColor.a;",

          "} else {",

            "gl_FragColor = texture2D( tColor, vUv );",
            "gl_FragColor.rgb *= 1./gl_FragColor.a;",

          "}",

          "if (vignette == 1.){",

            "gl_FragColor = vec4( mix(gl_FragColor.rgb, - vec3( vingenettingDarkening ), vec3( dot( (vUv - vec2(0.5)), (vUv - vec2(0.5)) ))), 1.0 );",
					  "gl_FragColor = vec4(1.0) - (vec4(1.0) - gl_FragColor) * (vec4(1.0) - gl_FragColor);",

          "}",
          //"gl_FragColor = vec4(rndVec,1.);",
				"}"

            ].join("\n")

    } );

};
testApp.setup = function(){
   //stats
   stats = new Stats();
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.top = '10px';
   stats.domElement.style.left = '10px';
   this.container.appendChild( stats.domElement );
   stats.domElement.hidden = !bStats;
   
   //camera
   camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 5,60);
   camera.position.set( 0, 10, 30 );
   camera.lookAt( new THREE.Vector3(0, 0, 0) );
   this.scene.add( camera );
   
   //lights
   var pointLight = new THREE.PointLight( );
   pointLight.position = camera.position;
   this.scene.add( pointLight );
   
   //load some geometry
   geo = new THREE.Mesh( new THREE.IcosahedronGeometry( 5, 1 ), new THREE.MeshNormalMaterial({shading: THREE.FlatShading}) );
   this.scene.add( geo );
   
   //particle emitter
   emitter = new LabParticleEmitter({ scene: this.scene,
                                    renderer: this.renderer,
                                    maxParticleCount: 10000 });
   
   for(var i=0; i<100; i++){
      worms.push( new Worm() );
      this.scene.add( worms[i].mesh );
   }

  // Post processing scene
  this.postScene = new THREE.Scene();

  this.postCamera = new THREE.OrthographicCamera ( -0.5, 0.5 , -0.5, 0.5, 0.001, 1000 );
  this.postCamera.position.z = 10;

  this.postScene.add( this.postCamera );

  this.renderTarget = {};
  this.renderTarget.color = new THREE.WebGLRenderTarget( window.innerWidth*2, window.innerHeight*2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } );
  this.renderTarget.depth = new THREE.WebGLRenderTarget( window.innerWidth*2, window.innerHeight*2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } );

  this.initPostprocessing();
  this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(1,1,96,24), this.postMaterial);
  this.postQuad.doubleSided = true;
  this.postScene.add( this.postQuad );

  // End post processing scene
  
}

testApp.update = function(){
   if(bStats) stats.update();
   
//   console.log(vectorTrails[0] && vectorTrails[0].age);
   _.each(vectorTrails, function(vectorTrail) {
       vectorTrail.update();
    });
   
   geo.rotation.x += .005;
   geo.rotation.y += .0005;
   
   count += .001;
   var target = worms[0].geometry.vertices[0].position;
   var delta = new THREE.Vector3();
   for(var i=1; i<worms.length; i++){
      
      delta.copy( worms[i].geometry.vertices[0].position );
      delta.subSelf( worms[i-1].geometry.vertices[0].position );
      delta.normalize();
      delta.multiplyScalar( .04 );
      worms[i].vel.multiplyScalar( .91 );
      worms[i].vel.subSelf( delta )
      
      worms[i].update( i *.1);
   }
   worms[0].update();
   
   this.camera.position.copy( target );
   
   //update particles
   currentTime += 1/60;//this.getElapsedTimeSeconds();
//   console.log( currentTime );
   var n, nx, ny, nz;
   var nOffset = .1;
   var nScl = .025;
   var attenuation = .975;
   for(var i=emitter.geometry.__webglParticleCount-1; i>=0; i--){
      p = emitter.particles[i];
      
      n = noise( p.pos.x, p.pos.y, p.pos.z );
      nx = n - noise( p.pos.x+nOffset, p.pos.y, p.pos.z );
      ny = n - noise( p.pos.x, p.pos.y+nOffset, p.pos.z );
      nz = n - noise( p.pos.x, p.pos.y, p.pos.z+nOffset );
      
      p.vel.multiplyScalar( attenuation );
      
      p.vel.addSelf( {x: nx*nScl, y: ny*nScl, z: nz*nScl });
      p.pos.addSelf( emitter.particles[i].vel );
      
      if(currentTime > p.birth + p.lifespan){
         emitter.removeParticle( i );
      }
   }
   
//   
//   //emit some particles from the geometry onceit's loaded
//      for(var i=0; i<1; i++){
//         var face = geo.geometry.faces[ randomInt( 0, geo.geometry.faces.length-1) ];//get random face
//         var pos = randomPointOnMesh( geo, face );
//         var vel = new THREE.Vector4(face.normal.x*3, face.normal.y*3, face.normal.z*3, 0 );
//         vel.multiplyScalar( .125 );//use it's normal as our new particle's velocity
//         geo.matrix.multiplyVector4( vel );//rotate the vel with the mesh's matrix
//
//         
//         // lifespan, size, length
//         var vectorTrail = new THREE.VectorTrail(pos, .5, 60, 0, randomInt(10,30), vectorMaterial).finished(removeVectorTrail);
//         geo.add(vectorTrail.mesh);
//         vectorTrail.id = vectorTrails.length;
//         vectorTrails.push(vectorTrail);
//         //         emitter.addParticle(pos,
////                             vel,
////                             {x: randomRange( .1, 1), y: randomRange( .1, 1), z: randomRange( .1, 1)},//color
////                             randomRange( .1, 2),//size
////                             currentTime,//time
////                             randomRange( 4, 8 ));//lifespan
//      }
}

var randomPointOnMesh = function( mesh, face ){
//   if(this.isLoaded){
      var randFace = face || mesh.geometry.faces[ LAB.randomInt( 0, mesh.geometry.faces.length-1) ];
      var pos = THREE.GeometryUtils.randomPointInFace( randFace, mesh.geometry, true ); 
//      mesh.matrixWorld.multiplyVector3( pos );
      
      return pos;
//   }
//   else return new THREE.Vector3(); 
}

//function removeVectorTrail(v) {
//   console.log('remove the vector trail!');
////   vectorTrails.splice(v.id, 1);
//   geo.remove( v.mesh );
//}
                           
testApp.draw = function(){
   //   console.log( 'testApp: drawing' );
   gl.clearColor( .2, .2, .25, 1 );
   
//  this.renderer.render( this.scene, camera, null, true );
  this.renderer.render( this.scene, camera, this.renderTarget.color, true );
  this.renderer.render( this.postScene, this.postCamera, null, true );
}

testApp.init();
testApp.animate();