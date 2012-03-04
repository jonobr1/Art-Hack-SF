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

      this.renderer.render( this.scene, camera, null, true );

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

       //update particles
       // APP.getElapsedTime() += 1/60; // TODO

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

  function Worm( parameters ){
     parameters = parameters || {};

     this.vel = parameters.vel || new THREE.Vector3( BaseApp.randomRange(-.1, .1), BaseApp.randomRange(-.1, .1), BaseApp.randomRange(-.1, .1) );
     this.speed = 5;

     this.geometry = parameters.geometry || new THREE.Geometry();
     //   this.generateGeometry();
     for(var i=0; i<50; i++){
        this.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3()));
     }
     this.geometry.dynamic = true;

     this.material = parameters.material || new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1.0, linewidth: 2 });
  //   this.material.vertexColors = true;

     this.mesh = new THREE.Line(this.geometry, this.material);
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
        nx = n - noise( p.x+nOffset + APP.getElapsedTime() + offset, p.y, p.z );
        ny = n - noise( p.x, p.y+nOffset + APP.getElapsedTime() + offset, p.z );
        nz = n - noise( p.x, p.y, p.z+nOffset + APP.getElapsedTime() + offset );

        this.geometry.vertices[0].position.addSelf( this.vel );
        this.geometry.vertices[0].position.addSelf( {x: nx, y: ny, z: nx });
        this.geometry.__dirtyVertices = true;
     }
  }

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
