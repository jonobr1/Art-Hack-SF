(function() {

  var THREE = THREE || {};

  var VaporTrail = THREE.VaporTrail = function(position, velocity, lifespan, size, length, material) {

    this.__callbacks = [];
    this.__noiseScale = 300 + (Math.random() * 100 - 50);
    this.__noiseStrength = 10 + (Math.random() * 10 - 5);

    this.age = 0;
    this.alive = 0;
    this.dead = false;

    this.steps = length;
    this.distance = velocity;
    this.lifespan = lifespan + this.steps;

    this.geometry = new THREE.Geometry();
    generateGeometry.call(this);
    this.geometry.dynamic = true;

    this.material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1.0, linewidth: Math.floor(Math.random() * 5) });
    this.material.vertexColors = true;

    this.mesh = new THREE.Line(this.geometry, this.material);
    this.mesh.position = position.clone();

  };

  _.extend(VaporTrail.prototype, {

    update: function() {

      if (this.dead) {
        return;
      }

      var length = this.geometry.vertices.length;
      var last = length - 1;

      // Go through existing steps and update position.

      for (var i = last; i > 0; i--) {

        var vect = this.geometry.vertices[i].position;
        var next = this.geometry.vertices[i - 1].position;

        vect.copy(next);

        var c = 1 - Math.sin(i / this.__index * Math.PI);
        this.geometry.colors[i].setRGB(c, c, c);

      }

      // Update the first step.

      if (this.alive < this.lifespan - this.steps) {

        var guide = this.geometry.vertices[0].position;
        var angle = noise(
            guide.x / this.__noiseScale,
            guide.y / this.__noiseScale,
            guide.z / this.__noiseScale
        ) * this.__noiseStrength;

        guide.addSelf(new THREE.Vector3(
          Math.cos(angle) * this.distance,
          Math.sin(angle) * this.distance,
          Math.cos(angle) * this.distance   // What is this value?
        ));

      }

      this.alive++;
      this.age = this.alive / this.lifespan;

      this.dead = this.age > 1.0;

      if (this.dead) {

        _.each(this.__callbacks, function(f) {
          if (_.isFunction(f)) {
            f(this);
          }
        }, this);

        this.__callbacks = [];

        if (this.mesh.parent) {
          this.mesh.parent.remove(this.mesh);
        } else{
          this.mesh.visible = false;
        }

      }

      this.geometry.__dirtyVertices = true;
      this.geometry.__dirtyColors = true;

    },

    finished: function(f) {

      if (this.dead) {
        f(this);
      } else {
        this.__callbacks.push(f);
      }

      return this;

    }

  });

  function generateGeometry() {

    _.each(_.range(this.steps), function(i) {

      var c = Math.sqrt(1 - Math.sin(i / this.steps * Math.PI));
      this.geometry.vertices.push(new THREE.Vertex());
      this.geometry.colors.push(new THREE.Color().setRGB(c, c, c));

    }, this);

  }

  return VaporTrail;

})();
