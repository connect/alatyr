/*
 * First person view
 * based on PointerLockControls.js by mrdoob
 */
W6Control = function( camera ){
    var t = this;

    camera.rotation.set(0,0,0);

    var pitchObject = new THREE.Object3D();
    pitchObject.add( camera );

    var yawObject = new THREE.Object3D();
    yawObject.position.y = cfg.eyeHeight;
    yawObject.add( pitchObject );

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var running = false;
    var crouching = false;

    var Speed = {
        normal: 2 / GQ,
        run: 6 / GQ,
        crouch: 1 /GQ
    }

    var isOnObject = false;
    var canJump = false;

    var velocity = new THREE.Vector3();

    var PI_2 = Math.PI / 2;

    var onMouseMove = function ( e ) {
        if ( t.enabled === false ) return;

        var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002 * cfg.sensitivity;
        pitchObject.rotation.x -= movementY * 0.002 * cfg.sensitivity;

        pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
    };

    var onKeyDown = function ( e ) {
        switch ( e.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if ( canJump === true ) velocity.y += (GQ/1.5);
                canJump = false;
                break;

            case 16: // shift
                running = true;
                break;

            case 17: // ctrl
                crouching = true;
                //e.preDefault();
                //e.stopPropagation();
                break;
        }
    };

    var onKeyUp = function ( e ) {
        //log( e.keyCode );
        switch( e.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

            case 16: // shift
                running = false;
                break;

            case 17: // ctrl
                crouching = false;
                //e.preDefault();
                //e.stopPropagation();
                break;
        }
        return false;
    };

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    var __constructor = function(){
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if ( havePointerLock ){
            var pointerlockchange = function( e ){
                if (document.pointerLockElement === container || document.mozPointerLockElement === container || document.webkitPointerLockElement === container ){
                    controls.enabled = true;
                    blocker.style.display = 'none';
                    cfg.ready = true;
                } else {
                    controls.enabled = false;
                    blocker.style.display = '';
                    //cfg.ready = false;
                }
            }

            var pointerlockerror = function( e ){
                //
            }

            document.addEventListener( 'pointerlockchange', pointerlockchange, false );
            document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
            document.addEventListener( 'pointerlockerror', pointerlockerror, false );
            document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

            blocker.addEventListener( 'click', function( e ){
                blocker.style.display = 'none';
                container.requestPointerLock = container.requestPointerLock || container.webkitRequestPointerLock;
                container.requestPointerLock();
            }, false );
        } else {
            blocker.innerHTML = 'Your browser does not seem to support Pointer Lock Api';
        }
    }

    t.enabled = false;

    t.getObject = function () {
        return yawObject;
    };

    t.isOnObject = function ( boolean ) {
        isOnObject = boolean;
        canJump = boolean;
    };

    t.getDirection = function() {
        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3( 0, 0, -1 );
        var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

        return function( v ) {
            rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
            v.copy( direction ).applyEuler( rotation );
            return v;
        }
    }();

    t.getState = function(){
        if (running && !crouching) {
            return 'Running';
        } else if (crouching) {
            return 'Crouching';
        } else if ( moveBackward || moveForward || moveLeft || moveRight) {
            return 'Walking';
        } else {
            return 'Standing';
        }
    }

    t.update = function ( delta ) {
        var speed;

        if ( t.enabled === false ) return;

        if (running && !crouching) {
            speed = Speed.run;
        } else if (crouching) {
            speed = Speed.crouch;
        } else {
            speed = Speed.normal;
        }

        delta *= 0.1;

        velocity.x += ( - velocity.x ) * 0.08 * delta;
        velocity.z += ( - velocity.z ) * 0.08 * delta;

        velocity.y -= 0.25 * delta;

        if ( moveForward ) velocity.z -= 0.24 * delta * speed;
        if ( moveBackward ) velocity.z += 0.24 * delta * speed;

        if ( moveLeft ) velocity.x -= 0.24 * delta * speed;
        if ( moveRight ) velocity.x += 0.24 * delta * speed;

        if ( isOnObject === true ) {
            velocity.y = Math.max( 0, velocity.y );
        }

        yawObject.translateX( velocity.x );
        yawObject.translateY( velocity.y );
        yawObject.translateZ( velocity.z );

        if ( crouching && yawObject.position.y < cfg.eyeHeight/2 ) {
            velocity.y = 0;
            yawObject.position.y = cfg.eyeHeight/2;
            canJump = true;
        } else if ( !crouching && yawObject.position.y < cfg.eyeHeight ) {
            velocity.y = 0;
            yawObject.position.y = cfg.eyeHeight;
            canJump = true;
        }
    };

    __constructor();
}

onMouseLost = function(e){
    if ( (e.toElement == null) && (e.relatedTarget == null) ){
        cfg.ready = false;
    }
}

onMouseCatch = function(e){
    if ( !cfg.ready ) cfg.ready = true;
}