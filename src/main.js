(function() {

  //

  var stats;
  var bStats =  true;
  var camera;
  var geo;
  var emitter;
  var count = 0;
  var vectorTrails = [];
  var vectorMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1.0, linewidth: 2 });
  var worms = [];

  _.extend(BaseApp.prototype, {

    draw: function() {

      this.renderer.render( this.scene, camera, this.renderTarget.color, true );
      this.renderer.render( this.postScene, this.postCamera, null, true );

    },

    initPostprocessing: function() {
      var postUniforms = {
    "time": { type: "f", value: 0 },
    "samplerSphere": { type: "fv", value: [0.000000,0.000000,-1.000000,0.000000,0.525731,-0.850651,0.500000,0.162460,-0.850651,0.000000,0.894427,-0.447213,0.500000,0.688191,-0.525731,0.850651,0.276394,-0.447213,0.309017,-0.425325,-0.850651,0.809017,-0.262865,-0.525731,0.525731,-0.723607,-0.447213,-0.309017,-0.425325,-0.850651,0.000000,-0.850651,-0.525731,-0.525731,-0.723607,-0.447213,-0.500000,0.162460,-0.850651,-0.809017,-0.262865,-0.525731,-0.850651,0.276394,-0.447213,-0.500000,0.688191,-0.525731,-0.309017,0.951057,0.000000,-0.809017,0.587785,0.000000,-0.525731,0.723607,0.447213,-1.000000,0.000000,0.000000,-0.809017,-0.587785,0.000000,-0.850651,-0.276394,0.447213,-0.309017,-0.951057,0.000000,0.309017,-0.951057,0.000000,0.000000,-0.894427,0.447213,0.809017,-0.587785,0.000000,1.000000,0.000000,0.000000,0.850651,-0.276394,0.447213,0.809017,0.587785,0.000000,0.309017,0.951057,0.000000,0.525731,0.723607,0.447213,0.000000,0.850651,0.525731,-0.809017,0.262865,0.525731,-0.500000,-0.688191,0.525731,0.500000,-0.688191,0.525731,0.809017,0.262865,0.525731,0.000000,0.000000,1.000000,0.309017,0.425325,0.850651,-0.309017,0.425325,0.850651,0.500000,-0.162460,0.850651,0.000000,-0.525731,0.850651,-0.500000,-0.162460,0.850651]},
    "samplerBokehHex": { type: "fv", value: [0.500000,0.000000,0.866025,0.166667,0.000000,0.866025,-0.166667,0.000000,0.866025,-0.500000,0.000000,0.866025,-0.666667,0.000000,0.577350,-0.833333,0.000000,0.288675,-1.000000,0.000000,0.000000,-0.833333,0.000000,-0.288675,-0.666667,0.000000,-0.577350,-0.500000,0.000000,-0.866025,-0.166667,0.000000,-0.866025,0.166667,0.000000,-0.866025,0.500000,0.000000,-0.866025,0.666667,0.000000,-0.577350,0.833333,0.000000,-0.288675,1.000000,0.000000,0.000000,0.833333,0.000000,0.288675,0.666667,0.000000,0.577350]},
    "tColor": { type: "t", value: 0, texture: this.renderTarget.color },

    "focus":    { type: "f", value: 0.56 },
		"aspect":   { type: "f", value: window.innerWidth/window.innerHeight },
		"maxblur":  { type: "f", value: 0.0035 },

    "screenWidth": { type: "f", value:window.innerWidth },
		"screenHeight": { type: "f", value:window.innerHeight },
		"vingenettingDarkening": { type: "f", value: 0.31 },

		"colorA": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		"colorB": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		"colorC": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

    };

    this.postMaterial = new THREE.MeshShaderMaterial({

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
        "uniform vec3 samplerBokehHex[18];",
        "uniform vec3 samplerSphere[42];",
        "uniform float focus;",
        "uniform float aspect;",

				"uniform float screenWidth;",
				"uniform float screenHeight;",
				"uniform float vingenettingDarkening;",

				"varying vec2 vUv;",

				"void main() {",

					"vec4 col = texture2D( tColor, vUv.xy );",
          "vec2 aspectcorrect = vec2( 1.0, aspect );",
          "vec3 rndUv = vec3(0.0);",


            "for( int i=1; i<18; i++ ){",
              "vec2 st = vUv - vec2(0.5);",

              "float dist = sqrt(st.s*st.s+st.t*st.t/aspect);",

              "rndUv.xy = vUv + (dist*maxblur*samplerBokehHex[i].xz*aspectcorrect);",

              "col.r += texture2D( tColor, rndUv.xy - (st*dist/50.0) ).r;",
              "col.ga += texture2D( tColor, rndUv.xy ).ga;",
              "col.b += texture2D( tColor, rndUv.xy + (st*dist/50.0) ).b;",

            "}",
            "gl_FragColor = col/18.;",
            "gl_FragColor.rgb *= 1./gl_FragColor.a;",



            "gl_FragColor = vec4( mix(gl_FragColor.rgb, - vec3( vingenettingDarkening ), vec3( dot( (vUv - vec2(0.5)), (vUv - vec2(0.5)) ))) , 1.0);",
					  "gl_FragColor = vec4(1.0) - (vec4(1.0) - gl_FragColor) * (vec4(1.0) - gl_FragColor);",

          //"gl_FragColor = vec4(col.aaa,1.);",
				"}"

            ].join("\n")

      });
    },

    setup: function(debug) {

      if (debug) {

        //stats
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '10px';
        stats.domElement.style.left = '10px';
        document.body.appendChild( stats.domElement );
        stats.domElement.hidden = !bStats;

      }

      //camera
      camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight);
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
                                       maxParticleCount: 10000,
                                       camera: camera });

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
  this.renderTarget.color = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } );

  this.initPostprocessing();
  this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(1,1,96,24), this.postMaterial);
  this.postQuad.doubleSided = true;
  this.postScene.add( this.postQuad );

  // End post processing scene

    },

    update: function() {

       if(bStats) stats.update();

       _.each(vectorTrails, function(vectorTrail) {
           vectorTrail.update();
        });

       geo.rotation.x += .005;
       geo.rotation.y += .0005;

       count += .001;
       var target = worms[0].geometry.vertices[0].position;
       var delta = new THREE.Vector3();
       // for(var i=1; i<worms.length; i++){
        _.each(worms, function(worm, i) {

          if (i > 0) {
            delta.copy( worms[i].geometry.vertices[0].position );
            delta.subSelf( worms[i-1].geometry.vertices[0].position );
            delta.normalize();
            delta.multiplyScalar( .04 );
            worms[i].vel.multiplyScalar( .91 );
            worms[i].vel.subSelf( delta )

            worms[i].update( i *.1);
          }
       });
       worms[0].update();

       this.camera.position.copy( target );

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

          if(APP.getElapsedTime() > p.birth + p.lifespan){
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
    ////                             {x: BaseApp.randomRange( .1, 1), y: BaseApp.randomRange( .1, 1), z: BaseApp.randomRange( .1, 1)},//color
    ////                             BaseApp.randomRange( .1, 2),//size
    ////                             APP.getElapsedTime(),//time
    ////                             BaseApp.randomRange( 4, 8 ));//lifespan
    //      }

    }

  });

  var Worm = function( parameters ) {

     parameters = parameters || {};

     this.vel = parameters.vel || new THREE.Vector3( BaseApp.randomRange(-.1, .1), BaseApp.randomRange(-.1, .1), BaseApp.randomRange(-.1, .1) );
     this.speed = 5;

     var color = Worm.Colors[Math.floor(Math.random() * Worm.Colors.length)];

     this.geometry = parameters.geometry || new THREE.Geometry();
     var length = parameters.length || 50;

      for(var i=0; i < length; i++){

        var c = new THREE.Color(color);
        var mod = (1 - i / length);

        c.r *= mod;
        c.g *= mod;
        c.b *= mod;

        this.geometry.vertices.push(new THREE.Vertex(new THREE.Vector3()));
        this.geometry.colors.push(c);
      }
     this.geometry.dynamic = true;

     this.material = parameters.material || new THREE.LineBasicMaterial({
       opacity: 1.0,
       linewidth: Math.floor(Math.random() * 5)
      });
     this.material.vertexColors = true;

     this.mesh = new THREE.Line(this.geometry, this.material);

  };

  _.extend(Worm, {

    Colors: [
   	  0xefefef,	
	  0xcccccc,
	  0x333333
    ]

  })

  _.extend(Worm.prototype, {

    update: function(offset) {


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
      nx = n - noise( p.x+nOffset + APP.getElapsedTime() + offset, p.y, p.z );
      ny = n - noise( p.x, p.y+nOffset + APP.getElapsedTime() + offset, p.z );
      nz = n - noise( p.x, p.y, p.z+nOffset + APP.getElapsedTime() + offset );

      this.geometry.vertices[0].position.addSelf( this.vel );
      this.geometry.vertices[0].position.addSelf( {x: nx, y: ny, z: nx });
      this.geometry.__dirtyVertices = true;
   }
});

var worms = [];

  function randomPointOnMesh( mesh, face ){
  //   if(this.isLoaded){
        var randFace = face || mesh.geometry.faces[ BaseApp.randomInt( 0, mesh.geometry.faces.length-1) ];
        var pos = THREE.GeometryUtils.randomPointInFace( randFace, mesh.geometry, true ); 
  //      mesh.matrixWorld.multiplyVector3( pos );

        return pos;
  //   }
  //   else return new THREE.Vector3(); 
  }


})();
