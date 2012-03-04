(function() {

  window.raf = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var gl, elapsedTime = 0;

  var BaseApp = window.BaseApp = function(params) {

    var params = _.defaults(params || {}, {
      debug: false
    });

    this.startTime = Date.now();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    this.scene.add( this.camera );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.gl = this.renderer._gl;

    document.body.appendChild(this.renderer.domElement);

    this.setup(params.debug);

    return this;

    // this.animate();

  };

  _.extend(BaseApp.prototype, {

    setup: function() {

       console.log( "BaseApp: setup ...override to extend" );

    },

    update: function() {

      

    },

    draw: function() {

      

    },

    animate: function() {

      var _this = this;

      raf(function() {
        _this.animate();
      });
      elapsedTime = Date.now() - this.startTime;
      this.update();
      this.draw();

    },

    getElapsedTime: function() {

      return elapsedTime;

    },

    getElapsedTimeSeconds: function() {

      return elapsedTime;

    }

  });

  _.extend(BaseApp, {

    randomRange: function( _min, _max) {
       return Math.random() * ( _max - _min ) + _min;
    },
    /**
     @function
     */
    randomInt: function( _min, _max) {
       return Math.floor( BaseApp.randomRange( _min, _max ));
    },
    /**
     @function
     */
    randomObject: function( _array ) {
       return _array[ Math.min(BaseApp.randomInt(0, _array.length ), _array.length-1)];
    }

  });

})();