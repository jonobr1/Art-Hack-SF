(function() {

    var currentRandom = Math.random;

    // Pseudo-random generator
    function Marsaglia(i1, i2) {
        // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
        var z = i1 || 362436069,
        w = i2 || 521288629;
        var nextInt = function() {
            z = (36969 * (z & 65535) + (z >>> 16)) & 0xFFFFFFFF;
            w = (18000 * (w & 65535) + (w >>> 16)) & 0xFFFFFFFF;
            return (((z & 0xFFFF) << 16) | (w & 0xFFFF)) & 0xFFFFFFFF;
        };

        this.nextDouble = function() {
            var i = nextInt() / 4294967296;
            return i < 0 ? 1 + i: i;
        };
        this.nextInt = nextInt;
    }

    Marsaglia.createRandomized = function() {
        var now = new Date();
        return new Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF);
    };

    // Noise functions and helpers
    function PerlinNoise(seed) {
        var rnd = seed !== undefined ? new Marsaglia(seed) : Marsaglia.createRandomized();
        var i,
        j;
        // http://www.noisemachine.com/talk1/17b.html
        // http://mrl.nyu.edu/~perlin/noise/
        // generate permutation
        var p = new Array(512);
        for (i = 0; i < 256; ++i) {
            p[i] = i;
        }
        for (i = 0; i < 256; ++i) {
            var t = p[j = rnd.nextInt() & 0xFF];
            p[j] = p[i];
            p[i] = t;
        }
        // copy to avoid taking mod in p[0];
        for (i = 0; i < 256; ++i) {
            p[i + 256] = p[i];
        }

        function grad3d(i, x, y, z) {
            var h = i & 15;
            // convert into 12 gradient directions
            var u = h < 8 ? x: y,
            v = h < 4 ? y: h === 12 || h === 14 ? x: z;
            return ((h & 1) === 0 ? u: -u) + ((h & 2) === 0 ? v: -v);
        }

        function grad2d(i, x, y) {
            var v = (i & 1) === 0 ? x: y;
            return (i & 2) === 0 ? -v: v;
        }

        function grad1d(i, x) {
            return (i & 1) === 0 ? -x: x;
        }

        function lerp(t, a, b) {
            return a + t * (b - a);
        }

        this.noise3d = function(x, y, z) {
            var X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255,
            Z = Math.floor(z) & 255;
            x -= Math.floor(x);
            y -= Math.floor(y);
            z -= Math.floor(z);
            var fx = (3 - 2 * x) * x * x,
            fy = (3 - 2 * y) * y * y,
            fz = (3 - 2 * z) * z * z;
            var p0 = p[X] + Y,
            p00 = p[p0] + Z,
            p01 = p[p0 + 1] + Z,
            p1 = p[X + 1] + Y,
            p10 = p[p1] + Z,
            p11 = p[p1 + 1] + Z;
            return lerp(fz,
            lerp(fy, lerp(fx, grad3d(p[p00], x, y, z), grad3d(p[p10], x - 1, y, z)),
            lerp(fx, grad3d(p[p01], x, y - 1, z), grad3d(p[p11], x - 1, y - 1, z))),
            lerp(fy, lerp(fx, grad3d(p[p00 + 1], x, y, z - 1), grad3d(p[p10 + 1], x - 1, y, z - 1)),
            lerp(fx, grad3d(p[p01 + 1], x, y - 1, z - 1), grad3d(p[p11 + 1], x - 1, y - 1, z - 1))));
        };

        this.noise2d = function(x, y) {
            var X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255;
            x -= Math.floor(x);
            y -= Math.floor(y);
            var fx = (3 - 2 * x) * x * x,
            fy = (3 - 2 * y) * y * y;
            var p0 = p[X] + Y,
            p1 = p[X + 1] + Y;
            return lerp(fy,
            lerp(fx, grad2d(p[p0], x, y), grad2d(p[p1], x - 1, y)),
            lerp(fx, grad2d(p[p0 + 1], x, y - 1), grad2d(p[p1 + 1], x - 1, y - 1)));
        };

        this.noise1d = function(x) {
            var X = Math.floor(x) & 255;
            x -= Math.floor(x);
            var fx = (3 - 2 * x) * x * x;
            return lerp(fx, grad1d(p[X], x), grad1d(p[X + 1], x - 1));
        };
    }

    //	these are lifted from Processing.js
    // processing defaults
    var noiseProfile = {
        generator: undefined,
        octaves: 4,
        fallout: 0.5,
        seed: undefined
    };

    function noise(x, y, z) {
        if (noiseProfile.generator === undefined) {
            // caching
            noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
        }
        var generator = noiseProfile.generator;
        var effect = 1,
        k = 1,
        sum = 0;
        for (var i = 0; i < noiseProfile.octaves; ++i) {
            effect *= noiseProfile.fallout;
            switch (arguments.length) {
            case 1:
                sum += effect * (1 + generator.noise1d(k * x)) / 2;
                break;
            case 2:
                sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2;
                break;
            case 3:
                sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2;
                break;
            }
            k *= 2;
        }
        return sum;
    }

    window.noise = noise;
})();
