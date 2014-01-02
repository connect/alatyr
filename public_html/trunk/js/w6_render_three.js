var textures = {}, geometry = {}, material = {};
var scene, camera, stats, mesh, controls, sun, flare;
var clock = new THREE.Clock();
//var frustum = new THREE.Frustum();



W6Render = function(opt){
    var t = this;

    var __constructor = function(i){
        var x,y,z,t,c,tObj,tGeo,geom,mater;
        var mesh;

        if (!Detector.webgl)
            Detector.addGetWebGLMessage();

        // SCENE
        //
        scene = new THREE.Scene();
        //scene.fog = new THREE.Fog(0xf0ffff, 1, (GQ * GQ * (GQ/2))*50 );

        //
        // LIGHT
        //
        sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
        sunLight.color.setHSL( 0.1, 1, 1 );
        //sunLight.position.set( -1, 1.75, 1 );
        sunLight.position.set( cfg.worldWidth, cfg.sunHeight, cfg.worldWidth );
        scene.add( sunLight );

        moonLight = new THREE.DirectionalLight( 0x00ffff, 0.2);
        moonLight.color.setHSL( 0.5, 1, 1 );
        moonLight.position.set( -cfg.worldWidth, -cfg.sunHeight, -cfg.worldWidth );
        scene.add( moonLight );

        if (cfg.shadow) {
            var d = cfg.worldWidth * GQ* 2; // 1000

            sunLight.castShadow = true;
            sunLight.shadowMapWidth = 2048;
            sunLight.shadowMapHeight = 2048;
            sunLight.shadowCameraLeft = -d;
            sunLight.shadowCameraRight = d;
            sunLight.shadowCameraTop = d;
            sunLight.shadowCameraBottom = -d;
            sunLight.shadowCameraFar = 3500;
            sunLight.shadowBias = -0.0001;
            sunLight.shadowDarkness = 0.35; // 0.35
            if (cfg.debug && cfg.debugSun) sunLight.shadowCameraVisible = true;

            moonLight.castShadow = true;
            moonLight.shadowMapWidth = 2048;
            moonLight.shadowMapHeight = 2048;
            moonLight.shadowCameraLeft = -d;
            moonLight.shadowCameraRight = d;
            moonLight.shadowCameraTop = d;
            moonLight.shadowCameraBottom = -d;
            moonLight.shadowCameraFar = 3500;
            moonLight.shadowBias = -0.0001;
            moonLight.shadowDarkness = 0.35; // 0.35
            if (cfg.debug && cfg.debugMoon) moonLight.shadowCameraVisible = true;
        }

        hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
        hemiLight.color.setHSL( 0.55, 0.75, 0.5 );
        //hemiLight.color = sunLight.color;
        hemiLight.groundColor.setHSL( 0.095, 1, 0.1 ); // 0.095, 1, 0.75
        hemiLight.position.set( 0, GQ*20, 0 );
        scene.add( hemiLight );


        // TODO: move to resource loader

        // TEXTURES
        //
        textures = {
            grass       : THREE.ImageUtils.loadTexture( 'img/misa/grass_top.png' ),
            leaf        : THREE.ImageUtils.loadTexture( 'img/32/leaf.gif' ),
            tree        : THREE.ImageUtils.loadTexture( 'img/16/tree.jpg' ),
            water       : THREE.ImageUtils.loadTexture( 'img/minecraft/water.png' ),
            snow        : THREE.ImageUtils.loadTexture( 'img/32/snow.jpg' ),
            sand        : THREE.ImageUtils.loadTexture( 'img/32/sand.jpg' ),
            highgrass   : THREE.ImageUtils.loadTexture( 'img/highgrass.png' ),
            Flare0      : THREE.ImageUtils.loadTexture( "img/lensflare0.png" ),
            Flare1      : THREE.ImageUtils.loadTexture( "img/lensflare1.png" ),
            Flare2      : THREE.ImageUtils.loadTexture( "img/lensflare2.png" ),
            Flare3      : THREE.ImageUtils.loadTexture( "img/lensflare3.png" ),
            moon        : THREE.ImageUtils.loadTexture( "img/lores_moon.jpg" ),
            clay        : THREE.ImageUtils.loadTexture( "img/minecraft/clay.png" ),
        }

        textures.leaf.wrapS = THREE.RepeatWrapping;
        textures.leaf.wrapT = THREE.RepeatWrapping;
        textures.leaf.repeat.set(2,2);

        waterAnimator = new TextureAnimator( textures.water, 1, 32, 32, 150 ); // texture, #horiz, #vert, #total, duration.

        //----------------------------------------------------------------------
        // GEOMETRY
        //

        // Grid
        if (cfg.debug){
            plane = new THREE.PlaneGeometry( cfg.worldWidth*GQ*2, cfg.worldDepth*GQ*2, cfg.worldWidth, cfg.worldDepth );
            plane.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        }

        // central line
        if (cfg.debug){
            var cLineGeom = new THREE.Geometry();
            cLineGeom.vertices.push(new THREE.Vector3(0,-cfg.worldWidth,0));
            cLineGeom.vertices.push(new THREE.Vector3(0,(cfg.worldWidth*GQ*2),0));
            cLine = new THREE.Line(
                    cLineGeom,
                    new THREE.LineBasicMaterial({ color: 0x000ff})
            );
            scene.add(cLine);

            var dLineGeom = new THREE.Geometry();
            dLineGeom.vertices.push(new THREE.Vector3(cfg.worldWidth,-cfg.worldWidth,cfg.worldWidth));
            dLineGeom.vertices.push(new THREE.Vector3(cfg.worldWidth,(cfg.worldWidth*GQ*2),cfg.worldWidth));
            dLine = new THREE.Line(
                    dLineGeom,
                    new THREE.LineBasicMaterial({ color: 0xff0000})
            );
            scene.add(dLine);

        }

        // sphere
        if (cfg.debug) {
            path = new THREE.Mesh(
                    new THREE.SphereGeometry( cfg.worldWidth*GQ*1.5, 4, 16 ),
                    new THREE.MeshBasicMaterial({color: 0x666666, transparent: true, wireframe: true})
            );
            path.position.set(cfg.worldWidth,0,cfg.worldWidth);
            scene.add(path);
        }


        geometry[OBJ_GROUND]    = new THREE.CubeGeometry(GQ,GQ,GQ,1,1,false);
        geometry[OBJ_TREE]      = [
            new THREE.CylinderGeometry(GQ/5,GQ/5,GQ/2,6,1, false),
            new THREE.CylinderGeometry(0,GQ/1.5,GQ,6,3, false),
            new THREE.CylinderGeometry(0,GQ/2,GQ,6,3, false),
            new THREE.CylinderGeometry(0,GQ/3,GQ,6,3, false)
        ];

        geometry[OBJ_WATER]     = new THREE.PlaneGeometry( GQ, GQ, 1, 1);
        geometry[OBJ_WATER].applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        geometry[OBJ_SUN]       = new THREE.SphereGeometry( GQ*5, 16, 16 );
        geometry[OBJ_MOON]      = new THREE.SphereGeometry( GQ*3, 16, 16 );
        geom = new THREE.PlaneGeometry( GQ, GQ, 1, 1);
        geom.applyMatrix( new THREE.Matrix4().makeRotationY( - Math.PI / 2 ) );
        geometry[OBJ_GRASS]     =  [
            geom,
            new THREE.PlaneGeometry( GQ, GQ, 1, 1)
        ];

        //----------------------------------------------------------------------
        // MATERIALS
        //
        material[OBJ_GROUND]    = new THREE.MeshLambertMaterial({ map: textures.grass, color: 0x75bd70  });
        material[OBJ_TREE]      = [
            new THREE.MeshLambertMaterial({ map: textures.tree }),
            new THREE.MeshLambertMaterial({ map: textures.leaf })
        ];
        material[OBJ_SNOW]      = new THREE.MeshPhongMaterial({ map: textures.snow, color: 0xffffff, ambient: 0xffffff, shines: 100});
        material[OBJ_SAND]      = new THREE.MeshLambertMaterial({ map: textures.sand });
        material[OBJ_WATER]     = new THREE.MeshPhongMaterial({ map: textures.water, transparent: true, opacity: 0.5, shines: 100,  color: 0x86c2e8, ambient: 0x86c2e8, bumpMap: textures.water, bumpScale: 1, metal: false });
        material[OBJ_SUN]       = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
        material[OBJ_MOON]      = new THREE.MeshBasicMaterial({map: textures.moon });
        material[OBJ_GRASS]     = [
            new THREE.MeshLambertMaterial({ map: textures.highgrass, side: THREE.DoubleSide, transparent: true}),
            new THREE.MeshLambertMaterial({ map: textures.highgrass, side: THREE.DoubleSide, transparent: true})
        ];
        material[OBJ_CLAY]      = new THREE.MeshLambertMaterial({ map: textures.clay, color: 0x91c3d6 });

        //----------------------------------------------------------------------
        // OBJECTS
        //
        if (cfg.debug){
            plane = new THREE.Mesh( plane, new THREE.MeshBasicMaterial({ color: 0xccccff, wireframe: true, transparent: true }) );
            plane.position.x = cfg.worldWidth*GQ/2;
            plane.position.z = cfg.worldDepth*GQ/2;
            scene.add(plane);
        } else {
            // underground shading plane
            var undergroundShade = new THREE.PlaneGeometry(cfg.worldWidth*2, cfg.worldDepth*2, 1, 1);
            undergroundShade.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI/2 ) );
            undergroundShade =  new THREE.Mesh( undergroundShade, new THREE.MeshBasicMaterial({ color: 0xff0000}) );
            undergroundShade.position.set(cfg.worldWidth, -cfg.worldWidth/2, cfg.worldDepth);
            scene.add(undergroundShade);
        }

        sun = new THREE.Mesh( geometry[OBJ_SUN], material[OBJ_SUN] );
	sun.position = sunLight.position;
	scene.add( sun );

        moon = new THREE.Mesh( geometry[OBJ_MOON], material[OBJ_MOON] );
	moon.position = moonLight.position;
	scene.add( moon );

        //addLensFlare( 0.55, 0.9, 0.1, sun.position.x, sun.position.y, sun.position.z );

        for (t in w_.obj){
            tObj = w_.obj[t];

            if (tObj.type == OBJ_GROUND) {

                if (tObj.y > cfg.snowHeight) {
                    tObj.gl = [new THREE.Mesh( geometry[OBJ_GROUND], material[OBJ_SNOW] )]
                } else if (tObj.y == 0) {
                    tObj.gl = [new THREE.Mesh( geometry[OBJ_GROUND], material[OBJ_SAND] )];
                } else if (tObj.y < 0) {
                    tObj.gl = [new THREE.Mesh( geometry[OBJ_GROUND], material[OBJ_CLAY] )];
                } else {
                    tObj.gl = [new THREE.Mesh( geometry[OBJ_GROUND], material[OBJ_GROUND] )];
                }

                tObj.gl[0].position.set( tObj.x*GQ, tObj.y*GQ+(GQ/2), tObj.z*GQ );

                if (cfg.shadow) {
                    tObj.gl[0].castShadow     = true;
                    tObj.gl[0].receiveShadow  = true;
                }
                scene.add( tObj.gl[0] );

            }
            else if (tObj.type == OBJ_TREE ) {

                geom  = geometry[OBJ_TREE];
                mater = material[OBJ_TREE];

                tObj.gl = new THREE.Mesh(geom[0], mater[0]);
                if (cfg.shadow) {
                    tObj.gl.castShadow     = true;
                    tObj.gl.receiveShadow  = true;
                }
                mesh = new THREE.Mesh(geom[1], mater[1]);
                    mesh.position.y = geom[0].height;
                    if (cfg.shadow) {
                        mesh.castShadow     = true;
                        mesh.recieveShadow  = true;
                    }
                    tObj.gl.add(mesh);
                mesh = new THREE.Mesh(geom[2], mater[1])
                    mesh.position.y = GQ;
                    if (cfg.shadow) {
                        mesh.castShadow     = true;
                        mesh.recieveShadow  = true;
                    }
                    tObj.gl.add(mesh);
                mesh = new THREE.Mesh(geom[3], mater[1]);
                    mesh.position.y = (GQ*1.5);
                    if (cfg.shadow) {
                        mesh.castShadow     = true;
                        mesh.recieveShadow  = true;
                    }
                    tObj.gl.add(mesh);

                tObj.gl.position.set( tObj.x*GQ, tObj.y*GQ + (geom[0].height/2), tObj.z*GQ ); // wood


                scene.add( tObj.gl );
            }
            else if (tObj.type == OBJ_GRASS ){

                geom  = geometry[OBJ_GRASS];
                mater = material[OBJ_GRASS];
                tObj.gl = [
                    new THREE.Mesh( geom[0], mater[0]),
                    new THREE.Mesh( geom[1], mater[0])
                ];
                tObj.gl[0].position.set( tObj.x*GQ, tObj.y*GQ+random(-(GQ/2),(GQ/2)), tObj.z*GQ );
                tObj.gl[1].position.set( tObj.x*GQ, tObj.y*GQ+random(-(GQ/2),(GQ/2)), tObj.z*GQ );
                if (cfg.shadow) {
                    tObj.gl[0].castShadow     = true;
                    tObj.gl[0].receiveShadow  = true;
                    tObj.gl[1].castShadow     = true;
                    tObj.gl[1].receiveShadow  = true;
                }
                scene.add( tObj.gl[0] );
                scene.add( tObj.gl[1] );
            }
            else if ((tObj.type == OBJ_WATER ) && (tObj.y == 0)) {

                tObj.gl = [new THREE.Mesh( geometry[OBJ_WATER], material[OBJ_WATER] )];
                tObj.gl[0].position.set(tObj.x*GQ, tObj.y*GQ+(GQ/2), tObj.z*GQ);
                if (cfg.shadow) {
                    tObj.gl[0].receiveShadow  = true;
                    tObj.gl[0].castShadow = true;
                }
                scene.add( tObj.gl[0] );
            } else {
                //...
            }
        }

        //
        // RENDER
        //
        if ( Detector.webgl )
            renderer = new THREE.WebGLRenderer({antialias: cfg.antialias});
        else
            renderer = new THREE.CanvasRenderer();

        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        renderer.setClearColor( 0x000000, 1 );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.physicallyBasedShading = true;
        if (cfg.shadow) {
            renderer.shadowMapEnabled = true;
            renderer.shadowMapCullFace = THREE.CullFaceBack;
        }

        //
        // CAMERA
        //
        if (cfg.controls == 0) {
            var zoom = 16;
            x = cfg.worldWidth/2;
            y = cfg.worldDepth/2;
            //camera = new THREE.OrthographicCamera( window.innerWidth/-zoom, window.innerWidth/zoom, window.innerHeight/zoom, window.innerHeight/-zoom, 0.1, 1000 );
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set( (cfg.worldWidth/2)-(30)  , GQ*30, (cfg.worldDepth/2)-(30) );
            camera.lookAt( cfg.worldWidth/2, cfg.worldDepth/2 );
            //document.getElementsByTagName('canvas')[0].onmousewheel({ wheelDelta: 10});
            //log (document.getElementsByTagName('canvas'));

        } else {
            camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
            camera.position.set( scene.width/2, 2, scene.width/2);
        }
        //frustum.setFromMatrix( new THREE.Matrix4().multiply( camera.projectionMatrix, camera.matrixWorldInverse ) );

        //
        // CONTROLS
        //
        // cfg.controls 0 : orbit camera
        // cfg.controls 1 : third person camera
        //
        if (cfg.controls == 0) {
            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target = new THREE.Vector3(cfg.worldWidth/2, 0, cfg.worldDepth/2);
            //controls.zoomSpeed = 2;
            scene.add( controls );
        } else {
            /*
            controls = new THREE.FirstPersonControls( camera );
            controls.activeLook = true;
            controls.movementSpeed = 1000;
            controls.lookSpeed = 0.125;
            controls.lookVertical = true;
            controls.constrainVertical = true;
            controls.verticalMin = 1.1;
            controls.verticalMax = 2.2;
            */
        }

        //
        // STATS
        //
        stats = new Stats();
        document.body.appendChild(stats.domElement);

        //
        // EVENTS
        //
        window.addEventListener( 'resize', t.update, false );
        //document.addEventListener('keydown', onKeyDown, false);
        window.addEventListener( 'mouseout', onMouseLost, false );
        window.addEventListener( 'mouseover', onMouseCatch, false );
    }

    //	this function will operate over each lensflare artifact, moving them around the screen
    var lensFlareUpdateCallback = function ( object ) {
        var f, fl = this.lensFlares.length;
        var flare;
        var vecX = -this.positionScreen.x * 2;
        var vecY = -this.positionScreen.y * 2;
        var size = object.size ? object.size : 16000;

        var camDistance = camera.position.length();

        for( f = 0; f < fl; f ++ ) {
          flare = this.lensFlares[ f ];

          flare.x = this.positionScreen.x + vecX * flare.distance;
          flare.y = this.positionScreen.y + vecY * flare.distance;

          flare.scale = size / camDistance;
          flare.rotation = 0;
        }
    }

    var addLensFlare = function( h, s, l, x, y, z ) {
            //var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
            //light.color.setHSL( h, s, l );
            //light.position.set( x, y, z );
            //scene.add( light );

            var flareColor = new THREE.Color( 0xffffff );
            flareColor.setHSL( h, s, l + 0.5 );

            lensFlare = new THREE.LensFlare( textures.Flare0, 700, 0.0, THREE.AdditiveBlending, flareColor );
            lensFlare.add( textures.Flare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textures.Flare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textures.Flare2, 512, 0.0, THREE.AdditiveBlending );

            lensFlare.add( textures.Flare3, 60, 0.6, THREE.AdditiveBlending );
            lensFlare.add( textures.Flare3, 70, 0.7, THREE.AdditiveBlending );
            lensFlare.add( textures.Flare3, 120, 0.9, THREE.AdditiveBlending );
            lensFlare.add( textures.Flare3, 70, 1.0, THREE.AdditiveBlending );

            //lensFlare.customUpdateCallback = lensFlareUpdateCallback;
            lensFlare.position = sun.position;

            scene.add( lensFlare );
    }

    var TextureAnimator = function (texture, tilesHoriz, tilesVert, numTiles, tileDispDuration)
    {
	// note: texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet.
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
    }

    /**
     * On Window Resize
     * @returns {undefined}
     */
    t.update = function(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    /**
     * Draw
     * @returns {undefined}
     */
    t.render = function(){
        stats.update();

        if (!cfg.ready) return;

        controls.update();
        //controls.update( clock.getDelta() );
        renderer.render( scene, camera );
        //time = Date.now();
    }


    __constructor();
}