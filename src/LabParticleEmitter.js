
var labParticle = function(){
   this.pos = new THREE.Vector3();
   this.vel = new THREE.Vector3();
   this.col = new THREE.Vector3( 1, 1, 1 );
   
   this.radius = 10.;
   this.birth = 0;
   this.lifespan = 1;
   
   this.copy = function( p ){
      this.pos.copy( p.pos );
      this.vel.copy( p.vel );
      this.col.copy( p.col );
      
      this.radius = p.radius;
      this.birth = p.birth;
      this.lifespan = p.lifespan;
   }
}

LabParticleEmitter = function ( parameters ) {
   parameters = parameters || {};
   
   //create particle data. this'll be crushed into arrays in the renderer
   this.maxParticleCount = parameters.maxParticleCount || 5000;
   this.particles = [];
   
   this.scene = parameters.scene;
   this.renderer = parameters.renderer;
   this.currentTime = 0;
   
   for(var i=0; i<this.maxParticleCount; i++){
      if(parameters.createParticle){
         //I used this to make particles with additional variables and methds
         this.particles[i] = parameters.createParticle();
      }
      else this.particles[i] = new labParticle();
   }
   
   //geometry and rendering
   this.attributes = {
   pColor: {type: "v3", value: []},
   radius: {type: "f", value: []},
   birth: {type: "f", value: []},
   lifespan: {type: "f", value: []},
   };
   this.geometry = new THREE.Geometry();
   
   for(var i=0; i<this.particles.length;i++){
      this.geometry.vertices[i] = new THREE.Vertex( this.particles[i].pos );
      this.attributes.pColor.value[i] = new THREE.Vector3(1, 0, 0);//this.particles[i].col;
      this.particles[i].col = this.attributes.pColor.value[i];
      this.attributes.radius.value[i] = this.particles[i].radius;
      this.attributes.birth.value[i] = this.particles[i].birth;
      this.attributes.lifespan.value[i] = this.particles[i].lifespan;
   }
   this.geometry.dynamic = true;
   this.geometry.__dirtyVertices = true;
   
   this.shader = parameters.shader || this.makeDefaultShader();
   this.shader.attributes = this.attributes;
   this.shader.transparent = true;
   
   this.particleSystem = new THREE.ParticleSystem( this.geometry, this.shader );
   
   
   this.scene.add( this.particleSystem );
   this.renderer.render( this.scene, parameters.camera );//this is kinda sloppy, but it's any easy way to create the webgl buffers
   this.particleSystem.geometry.__webglParticleCount = 0;// set the particle count to 0
   
};


LabParticleEmitter.prototype.setSort = function( bSort ){
   //this screws up the swapping of particles we use for removing dead particles
   this.particleSystem.sortParticles = bSort || !this.particleSystem.sortParticles;
}

LabParticleEmitter.prototype.makeDefaultShader = function( tex ){
   var defaultMat = new LabShader();
   
   var vString =  "attribute float radius;\n"+
   "attribute vec3 pColor;\n"+
   "varying vec3 col;\n"+
   "\n"+
   "void main()\n"+
   "{\n"+
   "  vec4 ecPos = modelViewMatrix * vec4(position, 1.);\n"+
   "  gl_Position = projectionMatrix * ecPos;\n"+
   "  col = pColor;\n"+
   "\n"+
   "  //attenuation\n"+
   "  gl_PointSize = clamp( 100. * radius/length(ecPos), 1.0, 120.0);\n"+
   "}";
   
   var fString =  "uniform sampler2D tex;\n"+
   "varying vec3 col;\n"+
   "\n"+
   "void main(){\n"+
   "  vec4 c = texture2D( tex, gl_PointCoord.xy );\n"+
   "  if(c.w < .05)  discard;\n"+
   "  gl_FragColor = vec4( col * c.xyz, c.w);\n"+
   "}";
   
   var tex = tex || this.makeParticleTexture( 32 );
   
   
   var shaderUniforms = {
   tex:   { type: "t", value: 0, texture: tex },
   };
   
   defaultMat.loadFromString( vString, fString, { uniforms: shaderUniforms });
   defaultMat.blending = THREE.NormalBlending;//THREE.AdditiveBlending;//THREE.MultiplyBlending;//THREE.SubtractiveBlending;//
   defaultMat.depthTest = true;
   
   return defaultMat;
}

LabParticleEmitter.prototype.makeParticleTexture = function( size ){
   //make texture
   var texData = [];
   var v2 = new THREE.Vector2();
   var center = new THREE.Vector2( size/2, size/2 );
   var dist = 0;
   var rad = (size*.5);
   for(var i=0; i<size; i++){
      for(var j=0;j<size; j++){
         v2.set( i, j );
         dist = Math.max(0, (1 - v2.distanceTo( center )/rad));
         dist = 255 * dist * dist;
         
         texData.push( 255 );
         texData.push( dist );
      }
   }
   
   var tex = new THREE.DataTexture(new Uint8Array(texData), size, size, THREE.LuminanceAlphaFormat );
   tex.needsUpdate = true;
   
   return tex;
}

LabParticleEmitter.prototype.addParticle = function( pos, vel, col, radius, currentTime, lifespan) {
   if(this.particleSystem.geometry.__webglParticleCount < this.maxParticleCount-1){
      
      var i = this.particleSystem.geometry.__webglParticleCount;
      this.particles[i].pos.copy( pos || {x:0, y:0, z:0} );
      this.particles[i].vel.copy( vel || {x:0, y:0, z:0} );
      this.particles[i].col.copy( col || {x:1, y:1, z:1} );
      
      this.particles[i].radius = this.attributes.radius.value[i] = radius || 10;
      this.particles[i].birth = this.attributes.birth.value[i] = currentTime || LAB.self.getElapsedTimeSeconds();
      this.particles[i].lifespan = this.attributes.lifespan.value[i] = lifespan || 10;
      
      this.particleSystem.geometry.__webglParticleCount++;
      this.geometry.__dirtyVertices = true;
      this.attributes.pColor.needsUpdate = true;
      this.attributes.radius.needsUpdate = true;
      this.attributes.birth.needsUpdate = true;
      this.attributes.lifespan.needsUpdate = true;
      
      return this.particles[i];
   }
   else{
      this.geometry.__dirtyVertices = true;
      this.attributes.pColor.needsUpdate = true;
      this.attributes.radius.needsUpdate = true;
      this.attributes.birth.needsUpdate = true;
      this.attributes.lifespan.needsUpdate = true;
      return null;
   }
};

LabParticleEmitter.prototype.removeParticle = function( index ){
   
   if(this.geometry.__webglParticleCount > 0){
      
      this.geometry.__webglParticleCount -= 1;
      
      this.particles[index].copy( this.particles[ this.geometry.__webglParticleCount ] );
      
      this.attributes.radius.value[index] = this.particles[index].radius;
      this.attributes.lifespan.value[index] = this.particles[index].lifespan;
      this.attributes.birth.value[index] = this.particles[index].birth;
      
      this.geometry.__dirtyVertices = true;
      this.attributes.pColor.needsUpdate = true;
      this.attributes.radius.needsUpdate = true;
      this.attributes.birth.needsUpdate = true;
      this.attributes.lifespan.needsUpdate = true;
   }
   
};


//LabParticleEmitter.prototype.updateAttributes = function(){
// //
//}
