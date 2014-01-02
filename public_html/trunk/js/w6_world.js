W6World = function(opt) {
    var t = this;
    opt = (opt == undefined) ? {} : opt;
    // geoboxes of the world
    t.geo = {};
    // objects of the world
    t.obj = new Array();
    // locations of the world
    t.location = {};

    var __constructor = function(opt){
        //t.genesis();
    }

    /**
     * World generator
     *
     * @param {type} opt
     * @returns {undefined}
     */
    t.genesis = function(opt){
        var c,x,y,z,X,Z;
        var geodata = [];
        var obj;

        var generateHeight = function( width, height ) {
            var data = [], perlin = new ImprovedNoise(),
            size = width * height, quality = 2, z = Math.random() * 100;

            for ( var j = 0; j < 4; j ++ ) {
                if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
                for ( var i = 0; i < size; i ++ ) {
                        var x = i % width, y = ( i / width ) | 0;
                        data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;
                }
                quality *= 4;
            }
            return data;
        }

        var getY = function( x, z ) {
            return ( geodata[ x + z * cfg.worldWidth ] * 0.2 ) | 0;
        }

        // generate ground
        geodata = generateHeight( cfg.worldWidth, cfg.worldDepth );

        for (x = 0; x < cfg.worldWidth; x++){
            for (z = 0; z < cfg.worldDepth; z++){
                y = getY(x, z);
                //t.addObj( OBJ_GROUND, x, y, z);
                obj = t.createObj( OBJ_GROUND, x, y, z);
                obj.name = x+':'+y+':'+z;
                if (!db.put(obj)) {
                    return false;
                }

                // grass
                /*
                if (random(1,3) == 3){
                    if ( (y>0) && (y < cfg.snowHeight) )
                        t.addObj( OBJ_GRASS, x, y+1, z);
                }*/

                // add underground
                //for (y = getY(x,z)-2; y < getY(x,z); y++) {
                //    t.addObj( OBJ_GROUND, x, y, z);
                //}
            }
            //db.put(  );
        }
        /*
        // generate trees
        for (c = 0; c < (cfg.worldWidth*4); c++) {
            x = random(0,cfg.worldWidth-1);
            z = random(0,cfg.worldDepth-1);
            y = getY(x,z);

            if (y>0) { // trees don't grow in water and sand
                t.addTree(
                    x,
                    y+1,
                    z
                );
            }
        }

        // water; spawn if Y < 0
        for (x = 0; x < cfg.worldWidth; x++) {
            for (z = 0; z < cfg.worldDepth; z++){
                //for (y = getY(x,z); y<0; y++){
                    y = getY(x,z);
                    if (y <= 0)
                    t.addObj(
                        OBJ_WATER,
                        x,
                        0,
                        z
                    );
                //}
            }
        }*/
        // create char
        /*
        me = new W6Creature(OBJ_HUMAN,
            random(0, cfg.worldWidth-1),
            0,
            random(0, cfg.worldDepth-1)
        );
        */
    }

    /**
     *
     * @param {type} x
     * @param {type} y
     * @param {type} z
     * @returns {undefined}
     */
    t.addTree = function(x,y,z) {
        // TODO: check the place before
        t.addObj( OBJ_TREE, x, y, z );
    }

    /**
     *
     * @param {type} obj
     * @param {type} y
     * @param {type} z
     * @param {type} type
     * @returns {Number|tobj.id}
     */
    t.addObj = function(type,x,y,z){
        var tobj = new W6Object({
            id          : t.obj.length,
            x           : x,
            y           : y,
            z           : z,
            type        : type
        });

        t.obj.push(tobj);
        var tgeo = t.geo[tobj.x+':'+tobj.y+':'+tobj.z];

        // if geo already exists?
        if (tgeo == undefined){
            tgeo = {
                x           : tobj.x,
                y           : tobj.y,
                z           : tobj.z,
                temperature : 10,
                humidity    : 50,
                objects     : new Array()
            };
        }

        //put obj into geo
        tgeo.objects.push(tobj.id);
        t.geo[tobj.x+':'+tobj.y+':'+tobj.z] = tgeo;

        return tobj.id;
    }

    t.createObj = function(type,x,y,z){
        var tobj = new {
            x           : x,
            y           : y,
            z           : z,
            t        : type
        };

        return tobj;
    }

    /**
     *
     * @returns {undefined}
     * __________
     * |        |
     * |        |
     * |________|
     *
     */
    t.locationUpdate = function(){
        if (!cfg.ready) return;

        var object = controls.getObject();
        var pre = Quad*0.40;
        if (pre > Quad-1) pre = Quad-1;
        var max1 = Quad-1-pre;
        var max2 = Quad-1;
        var x = Math.round( object.position.x / GQ );
        var z = Math.round( object.position.z / GQ );
        var X = Math.round( (object.position.x - halfQuad*GQ) / GQ / Quad);
        var Z = Math.round( (object.position.z - halfQuad*GQ) / GQ / Quad);

        selector.position.set(
                (x*GQ) + halfGQ,
                0.1,
                (z*GQ) + halfGQ
        );

        var Xx = (X*Quad - x) % Quad;
        Xx = (Xx < 0) ? (-Xx) : (Xx);
        var Zz = (Z*Quad - z) % Quad;
        Zz = (Zz < 0) ? (-Zz) : (Zz);

        //log ( '['+X+','+Z+'] '+Xx+', '+Zz);
        gui.coords.innerHTML = '[X:'+X+', Z:'+Z+'] x:'+Xx+', z:'+Zz;

        if ( t.isInSquare(Xx,Zz, 0, 0, pre, max2)  ) {
             t.locationLoad({ x: X-1, z: Z});
        }
        if ( t.isInSquare(Xx,Zz, max1, 0, max2, max2)  ) {
            t.locationLoad({ x: X+1, z: Z});
        }
        if ( t.isInSquare(Xx,Zz, 0, 0, max2, pre)  ) {
            t.locationLoad({ x: X, z: Z-1});
        }
        if ( t.isInSquare(Xx,Zz, 0, max1, max2, max2)  ) {
            t.locationLoad({ x: X, z: Z+1});
        }

        // corners
        if ( t.isInSquare(Xx,Zz, 0, 0, pre, pre)  ) {
            t.locationLoad({ x: X-1, z: Z-1});
        }
        if ( t.isInSquare(Xx,Zz, 0, max1, pre, max2)  ) {
            t.locationLoad({ x: X-1, z: Z+1});
        }
        if ( t.isInSquare(Xx,Zz, max1, 0, max2, pre)  ) {
            t.locationLoad({ x: X+1, z: Z-1});
        }
        if ( t.isInSquare(Xx,Zz, max1, max1, max2, max2)  ) {
            t.locationLoad({ x: X+1, z: Z+1});
        }

        // extreeme speed, check current Quad
        t.locationLoad({ x: X, z: Z});
    }

    t.locationLoad = function(sq){
        if (sq.x == undefined || sq.z == undefined) return;
        if (Location[sq.x+':'+sq.z]) return;

        var r = random(10,99), g = random(10,99), b = random(10,99);
        var color = parseInt('0x'+r+g+b);

        log(' Loading location: '+sq.x+', '+sq.z);
        var mesh = new THREE.Mesh(
                Geometry.ground,
                new THREE.MeshBasicMaterial({ color: color, wireframe: false })
        );
        mesh.position.set(
                sq.x * Quad * GQ + (halfQuad*GQ),
                0,
                sq.z * Quad * GQ + (halfQuad*GQ)
        );
        scene.add( mesh );

        mesh = new THREE.Mesh(
                Geometry.ground,
                new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
        );
        mesh.position.set(
                sq.x * Quad * GQ + (halfQuad*GQ),
                0.1,
                sq.z * Quad * GQ + (halfQuad*GQ)
        );
        scene.add( mesh );

        Location[sq.x+':'+sq.z] = true; // mark location loaded
        Location.count++;
    }

    t.locationUldoad = function(sq){
        if (sq.x == undefined || sq.z == undefined) return;
        if (!Location[sq.x+':'+sq.z]) return;
    }

    /**
     *
     * @param {type} x
     * @param {type} z
     * @param {type} x1
     * @param {type} z1
     * @param {type} x2
     * @param {type} z2
     * @returns {unresolved}
     */
    t.isInSquare = function(x,z,x1,z1,x2,z2){
        if ( (x >= x1) && (x <= x2) && (z >= z1) && (z <= z2) )
            return true;
        else
            return false;
    }

    __constructor(opt);
}
