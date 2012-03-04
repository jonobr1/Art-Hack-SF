

(function() {
  //

  var light;
  var stats;
  var bStats =  true;
  var camera;
  var letterMesh, _letterMesh, reference_mesh;
  var prevMesh;
  var cameraPosition = new THREE.Vector3(), cameraLookAt = new THREE.Vector3(), _cameraLookAt = new THREE.Vector3();
  var container = new THREE.Object3D();
  var emitter;
  var count = 0;
  var worms = [];

	//camera process
	var ping, pong, webcamRT, webcamScene, webcamPlane, webcamCam, webcamRenderer;

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

    this.texture = new THREE.Texture( this.canvas );
    this.texture.magFilter = THREE.LinearMipMapLinearFilter;
    this.texture.minFilter = THREE.LinearMipMapLinearFilter;

    this.displacementMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'map': { type: 't', value: _.uniqueId(), texture: this.texture },
        'offset_x': { type: 'f', value: 0 },
        'offset_y': { type: 'f', value: 0 }
      },
      vertexShader: [

        'uniform float offset_x;',
        'uniform float offset_y;',
        'uniform sampler2D map;',
        'varying float dist;',

        'varying vec2 vUv;',

        'void main() {',

        'vUv = ( uv / 3.0 ) + vec2( offset_x, offset_y );',
        'vUv.x = mod(vUv.x, 1.0);',
        'vUv.y = mod(vUv.y, 1.0);',

        'vec4 color = texture2D(map, vUv);',
        'dist = (color.r + color.g + color.b) / 3.0;',

        'vec4 pos = vec4(position + normal * dist, 1.0);',
        'gl_Position = projectionMatrix * modelViewMatrix * pos;',

        '}'

      ].join('\n'),
      fragmentShader: [

      'uniform sampler2D map;',

      'varying vec2 vUv;',

      'varying float dist;',

      'void main() {',

      // 'gl_FragColor = texture2D(map, vUv) * vec4(vec3(dist), 1.);',
      'gl_FragColor = vec4(vec3(dist*dist*dist*1.1), 1.);',

      '}'

      ].join('\n')
    });

    this.scene.add(container);

    letterMesh = createLetterMesh('A', this.displacementMaterial);

    cameraLookAt.copy( letterMesh.position );
    _cameraLookAt.copy( cameraLookAt );
    cameraPosition.copy( letterMesh.position ).addSelf( new THREE.Vector3(0, 0, 10) );

    container.add(letterMesh);

    reference_mesh = letterMesh;

    this.postMaterial = new THREE.ShaderMaterial({

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

        "uniform float maxblur;",   // max blur amount
        "uniform float aperture;",  // aperture - bigger values for shallower depth of field
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
            
              // "col.r += texture2D( tColor, rndUv.xy - (st*dist/50.0) ).r;",
              "col += texture2D( tColor, rndUv.xy );",
              // "col.b += texture2D( tColor, rndUv.xy + (st*dist/50.0) ).b;",
            
            "}",
            // "gl_FragColor = col;",
            "gl_FragColor = col/18.;",
            "gl_FragColor.rgb *= 1./gl_FragColor.a;",



            "gl_FragColor = vec4( mix(gl_FragColor.rgb, - vec3( vingenettingDarkening ), vec3( dot( (vUv - vec2(0.5)), (vUv - vec2(0.5)) ))) , 1.0);",
            "gl_FragColor = vec4(1.0) - (vec4(1.0) - gl_FragColor) * (vec4(1.0) - gl_FragColor);",

          //"gl_FragColor = vec4(col.aaa,1.);",
        "}"

            ].join("\n")

      });


	//camera process
	ping = new THREE.WebGLRenderTarget( 256, 256 );// this.canvas.width, this.canvas.height );
	pong = new THREE.WebGLRenderTarget( 256, 256 );// this.canvas.width, this.canvas.height );
	webcamRT = ping;
	
	
	
    this.webcamProcess = new THREE.ShaderMaterial({

        uniforms: {
	        'webcam': { type: 't', value: 0, texture: this.texture },
	        'lastwebcam': { type: 't', value: 1, texture: webcamRT },
			'smoothness': { type: 'f', value: .7 },
		},
		
        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = vec2( uv.x, 1.0 - uv.y );",
                "gl_Position = vec4( position, 1.0 );//projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

        "uniform sampler2D webcam;",
        "uniform sampler2D lastwebcam;",

        "uniform float smoothness;",



        "varying vec2 vUv;",

		"void main() {",
			// "vec4 col = texture2D( tColor, vUv.xy );",
			"gl_FragColor = vec4(texture2D( webcam, vUv.xy ).xyz*(1.-smoothness) + texture2D( lastwebcam, vUv.xy ).xyz*smoothness, 1.) ;",
		"}"

            ].join("\n")

      });
	
	webcamCam = new THREE.OrthographicCamera ( -0.5, 0.5 , -0.5, 0.5, 0.001, 1000 );
	webcamScene = new THREE.Scene();
	webcamPlane = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.webcamProcess );
	webcamPlane.doubleSided = true;
	
	webcamPlane.material.uniforms.lastwebcam.texture = pong;
	
	webcamScene = new THREE.Scene();
	webcamScene.add( webcamCam );
	webcamScene.add( webcamPlane );
	this.renderer.render( webcamScene, webcamCam, pong, true );
	
		
    },

	pingpong: function() {
		webcamRT = ping;
		ping = pong;
		pong = webcamRT;
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
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
      camera.position.set( 0, 0, 30 );
      // camera.lookAt( new THREE.Vector3(0, 0, 0) );
      this.scene.add( camera );

      //lights

      // this.scene.add( geo );

      //particle emitter

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

  var material = new THREE.LineBasicMaterial({
     opacity: 1.0,
     linewidth: 1
    });

  for(var i=0; i<100; i++){

    var worm = new Worm({
      material: material
    });
     worms.push( worm );
     worm.reset( reference_mesh.children[0] );

     this.scene.add( worm.mesh );

  }

  // lights

  light = new THREE.DirectionalLight();
  light.position.copy(camera.position);
  light.intensity = 0.1;
  light.castShadow = true;
  light.shadowDarkness = 0.3;
  light.shadowCameraVisible = false;

  this.scene.add( light );

  // End post processing scene

    },

    update: function() {

       if(APP.debug) stats.update();

       // geo.rotation.x += .005;
       // geo.rotation.y += .0005;

       count += .001;
       var target = worms[0].geometry.vertices[0].position;
       var delta = new THREE.Vector3();

       var brightness = APP.meter;

        _.each(worms, function(worm, i) {

          delta.copy( worms[i].geometry.vertices[0].position );
          delta.subSelf( worms[wrap(i - 1, worms.length)].geometry.vertices[0].position );
          delta.normalize();
          delta.multiplyScalar( .04 );

          worms[i].vel.multiplyScalar( .91 );
          worms[i].vel.subSelf( delta );

          worms[i].update( reference_mesh );

       });

       updateCamera.call(this);

  		webcamPlane.material.uniforms.lastwebcam.texture = ping;

  		this.renderer.render( webcamScene, webcamCam, pong, true );
		
  		letterMesh.children[0].material.uniforms.map.texture = pong;
		
  		this.pingpong();
		
      this.texture.needsUpdate = true;

    }

  });

  function updateCamera() {

    camera.position.x += (cameraPosition.x - camera.position.x) * 0.0625;
    camera.position.y += (cameraPosition.y - camera.position.y) * 0.0625;
    camera.position.z += (cameraPosition.z - camera.position.z) * 0.0625;

    _cameraLookAt.x += (cameraLookAt.x - _cameraLookAt.x) * 0.0625;
    _cameraLookAt.y += (cameraLookAt.y - _cameraLookAt.y) * 0.0625;
    _cameraLookAt.z += (cameraLookAt.z - _cameraLookAt.z) * 0.0625;

    camera.lookAt(_cameraLookAt);

  }

  var Worm = function( parameters ) {

     parameters = parameters || {};

     this.lifespan = 100 + Math.floor(Math.random() * 250);
     this.age = 0;
     this.dead = false;

     this.vel = parameters.vel || new THREE.Vector3( BaseApp.randomRange(-1, 1), BaseApp.randomRange(-1, 1), BaseApp.randomRange(-1, 1) );
     this.speed = 5;

     var color = Worm.Colors[Math.floor(Math.random() * Worm.Colors.length)];

     this.geometry = parameters.geometry || new THREE.Geometry();
     var length = this.length = parameters.length || 50;

      for(var i=0; i < length; i++){

        var c = new THREE.Color(color);
        var mod = Math.sqrt(1 - Math.sin(i / length * Math.PI));

        c.r *= map(mod, 0, 1, c.r, Math.min(c.r * 1.5, 255));
        c.g *= map(mod, 0, 1, c.g, Math.min(c.g * 1.5, 255));
        c.b *= map(mod, 0, 1, c.b, Math.min(c.b * 1.5, 255));

        this.geometry.vertices.push(new THREE.Vertex(new THREE.Vector3()));
        this.geometry.colors.push(c);
     }
     this.geometry.dynamic = true;

     this.material = parameters.material;
     this.material.vertexColors = true;

     this.mesh = new THREE.Line(this.geometry, this.material);

  };

  _.extend(Worm, {

    Colors: [
      0xefefef,
      0xcccccc,
      0xaaaaaa,
      0x333333,
      0x666666,
      0x999999
      // 0xb04a8f,
      // 0x5e289f,
      // 0x903d96,
      // 0xff0000,
      // 0x00AEEF,
      // 0x00EDA9
    ]

  })

  _.extend(Worm.prototype, {

    update: function(mesh) {

      if (this.dead) {
        return;
      }

      var brightness = Math.min(APP.meter * 100, 1.0);

      for(var i=this.geometry.vertices.length-1; i>=1; i--) {
         // this.geometry.vertices[i].position.multiplyScalar(.3);
         // this.geometry.vertices[i].position.x += this.geometry.vertices[i-1].position.x * 0.7;
         // this.geometry.vertices[i].position.y += this.geometry.vertices[i-1].position.y * 0.7;
         // this.geometry.vertices[i].position.z += this.geometry.vertices[i-1].position.z * 0.7;
         this.geometry.vertices[i].position.copy(this.geometry.vertices[i - 1].position);
      }

      this.age++;

      if (this.age < this.lifespan) {

        this.geometry.vertices[0].position.addSelf( this.vel.multiplyScalar(brightness) );

      } else {

        var last = this.geometry.vertices[this.geometry.vertices.length - 1].position;
        var first = this.geometry.vertices[0].position;

        if (last.x === first.x && last.y === first.y && last.z === first.z) {
          this.dead = true;
          this.reset(mesh.children[0]);
        }

      }

      this.geometry.__dirtyVertices = true;

   },

   reset: function(mesh, amt) {

     var face = mesh.geometry.faces[BaseApp.randomInt( 0, mesh.geometry.faces.length-1)];
     var pos = randomPointOnMesh(mesh, face);
     var normal = face.normal;

     this.vel.copy(normal);

     _.each(this.geometry.vertices, function(vert) {
       vert.position.copy(pos);
     });

     this.age = 0;
     this.dead = false;

   }

});

  function createLetterMesh(letter, mat) {

    var bevelEnabled = false;
    var bevelThickness = 0;
    var bevelSize = 0;
    var font = 'helvetiker';
    var height = 0;
    var size = 5;
    var curves = 0;
    var weight = 'bold';
    var style = 'normal';
    var bend = false;

    var geometry = new THREE.TextGeometry(letter, {

      amount: 0,
      size: size,
      curveSegments: curves,
      height: height,
      font: font,
      weight: weight,
      style: style,

      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: bevelEnabled,

      bend: bend,

      material: 0,
      extrudeMaterial: 0

    });

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    // var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } );
    var material = mat;
    material.color = 0xffffff;
    material.shading = THREE.SmoothShading;
    var mesh = new THREE.Mesh(geometry, material);

    var height = ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ) 

    mesh.position.x = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    mesh.position.y = 0.5 * height;
    mesh.position.z = 0;
    
    mesh.rotation.x = Math.PI;

    mesh.receiveShadow = true;
    mesh.castShadow = true;

    var obj = new THREE.Object3D();
    obj.add(mesh);

    return obj;

  }

  function goToNewLetter(letter) {

    if (prevMesh) {
      container.remove(prevMesh);
    }

    _letterMesh = createLetterMesh.call(APP, letter, APP.displacementMaterial);

    var amt = -50;
    var off = 0;
    var randomPointInSpace = new THREE.Vector3(0, 0, amt).addSelf(letterMesh.position);

    _letterMesh.position.copy(randomPointInSpace);
    cameraLookAt.copy(randomPointInSpace);
    cameraPosition.copy(randomPointInSpace).addSelf(new THREE.Vector3(0, 0, 10));

    container.add(_letterMesh);

    prevMesh = letterMesh;
    letterMesh = reference_mesh = _letterMesh;

    _.defer(function() {
      _.each(worms, function(worm) {
        worm.reset(reference_mesh.children[0]);
      });
    });

  }

  function randomPointOnMesh( mesh, face ) {

    mesh.updateMatrix();

    var randFace = face || mesh.geometry.faces[ BaseApp.randomInt( 0, mesh.geometry.faces.length-1) ];
    var pos = THREE.GeometryUtils.randomPointInFace( randFace, mesh.geometry, true ); 

    return mesh.parent.matrix.multiplyVector3(mesh.matrix.multiplyVector3(pos));

  }

  function wrap(v, length) {

    while (v < 0) {
      v += length;
    }

    return v % length;

  }

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  var elems = document.querySelectorAll('li a');
  _.each(elems, function(elem) {
    elem.addEventListener('click', function() {
      var className = this.getAttribute('class');
      if (className === 'selected') {
        return;
      }
      var letter = this.innerHTML;
      _.each(elems, function(elem) {
        elem.setAttribute('class', '');
      });
      this.setAttribute('class', 'selected');
      goToNewLetter(letter);
    }, false);
  });

})();
