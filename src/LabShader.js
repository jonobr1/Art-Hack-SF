
var LabShader = function ( parameters ) {
//   THREE.ShaderMaterial.call( this );
   
   parameters = parameters || {};
   if(parameters.name){
      $.ajax({ async: false, type: 'GET', url: parameters.name.concat( ".vert"),
             success: function(data) { parameters.vertexShader = data.slice( 0, data.length ); } });
      
      $.ajax({ async: false, type: 'GET', url: parameters.name.concat( ".frag"),
             success: function(data) { parameters.fragmentShader = data.slice( 0, data.length ); }});
      
      THREE.ShaderMaterial.call( this, parameters );
   }   
   
};

LabShader.prototype = new THREE.ShaderMaterial();
LabShader.prototype.constructor = LabShader;
LabShader.prototype.supr = THREE.ShaderMaterial.prototype;


/**
 @function
 @public
 */
LabShader.prototype.loadFromString = function( vertString, fragString, parameters ){
   parameters = parameters || {};
   parameters.vertexShader = vertString;
   parameters.fragmentShader = fragString;
   
   THREE.ShaderMaterial.call( this, parameters );
};

LabShader.prototype.loadFile = function( location, parameters ){
   console.log( location );
   parameters = parameters || {};
   if(location){
      $.ajax({ async: false, type: 'GET', url: location.concat( ".vert"),
             success: function(data) { parameters.vertexShader = data.slice( 0, data.length ); } });
      
      $.ajax({ async: false, type: 'GET', url: location.concat( ".frag"),
             success: function(data) { parameters.fragmentShader = data.slice( 0, data.length ); }});
      THREE.ShaderMaterial.call( this, parameters );
   }   
};

