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

    var _this = this;

    this.startTime = Date.now();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    this.scene.add( this.camera );

    this.renderer = new THREE.WebGLRenderer( { antialias: true, clearColor: 0xfbe4d4, clearAlpha: 1.0 } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.gl = this.renderer._gl;

    document.body.appendChild(this.renderer.domElement);

    var width = params.width || 640, height = params.height || 480;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    this.video = document.createElement('video');
    this.video.width = width;
    this.video.height = height;
    this.video.autoplay = true;

    document.body.appendChild(this.canvas);

    this.hasUserMedia = navigator.webkitGetUserMedia ? true : false;

    if (this.hasUserMedia) {

      navigator.webkitGetUserMedia('video', function(stream){
        _this.video.src = webkitURL.createObjectURL(stream);
      }, function(error){
        console.log('Failed to get a stream due to', error);
      });

    }

    this.setup(params.debug);

    return this;

    // this.animate();

  };

  _.extend(BaseApp.prototype, {

    setup: function() {

       console.log( 'BaseApp: setup ...override to extend' );

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


      /**
       * Webcam stuff!
       */

       if (this.hasUserMedia) {

         var w = this.ctx.canvas.width, h = this.ctx.canvas.height;

         this.ctx.drawImage(this.video, 0, 0, w, h);

         var data = this.ctx.getImageData(0, 0, w, h).data;
         var totalBrightness = 0;
         var count = 0;

         for(var i = 0; i < data.length; i+=4) {

           var r = data[i];
           var g = data[i+1];
           var b = data[i+2];
           var brightness = (3*r+4*g+b)>>>3;

           totalBrightness+=brightness;
           count++;

           data[i] = brightness;
           data[i+1] = brightness;
           data[i+2] = brightness;

         }

         this.meter = Math.floor(totalBrightness / count) / 255;

       } else {

         // Nope

         this.meter = 1.0;

       }

       // console.log(this.meter);

      /**
       * WebGL Stuff!
       */

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
