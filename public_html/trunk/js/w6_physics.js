/**
 *
 * All the physics calculations goes here
 *
 */
W6Physics = function(opt){
    var t = this;
    var ready = false;

    var __constructor = function(opt){
        ready = true;
        counter = 0;
    }

    t.update = function(){ //
        if (!ready) return
        else ready = false;

        counter+=  1;// * clock.getDelta();
        var x,y,z,i,c,tobj,tgeo, ogeo;

        for (i in w_.obj) {
            tobj = w_.obj[i];

            //tobj.gl.visible = frustum.intersectsObject( tobj.gl );


            /* DEBUG - Ground fall test
            if ( (counter == 300) ) {

                if (tobj.type == OBJ_GROUND) {
                    tgeo = w_.geo[tobj.x+':'+tobj.y+':'+tobj.z];
                    c = tgeo.objects.indexOf(tobj.id);
                    tgeo.objects.splice(c,1);
                    w_.geo[tobj.x+':'+tobj.y+':'+tobj.z] = tgeo;

                    tobj.y -= 10;
                    tobj.gl.position.y = tobj.y * GQ + GQ;
                    tgeo = w_.geo[tobj.x+':'+tobj.y+':'+tobj.z];
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
                    tgeo.objects.push(tobj.id);
                    w_.geo[tobj.x+':'+tobj.y+':'+tobj.z] = tgeo;
                }
            }*/

            if (tobj.type != OBJ_GROUND){
                tgeo = w_.geo[tobj.x+':'+(tobj.y-1)+':'+tobj.z];


                // Free fall
                if (!(tobj.type == OBJ_WATER) && !(tobj.y == 0)) // except top water level
                if ( (tgeo == undefined) || (tgeo.objects.length == 0) ){
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

                    tobj.y--;
                    tobj.gl[0].position.y = tobj.y * GQ + ( tobj.gl[0].geometry.height / 2 );
                    tgeo.objects.push(tobj.id);
                    w_.geo[tobj.x+':'+tobj.y+':'+tobj.z] = tgeo;

                    tgeo = w_.geo[tobj.x+':'+(tobj.y+1)+':'+tobj.z];
                    c = tgeo.objects.indexOf(tobj.id);
                    tgeo.objects.splice(c,1);
                    w_.geo[tobj.x+':'+(tobj.y+1)+':'+tobj.z] = tgeo;
                }

                // Water
                waterAnimator.update(32000 * clock.getDelta());

                if ((tobj.type == OBJ_WATER) && (tobj.y == 0)){
                    tobj.gl[0].position.y = tobj.y * GQ + (GQ/2)+ (Math.sin(clock.getElapsedTime())/3);
                }

            }
        }

        var per;
        var R = cfg.sunHeight;
        if (counter > 360) counter = 0;

        c = cfg.worldWidth;

        // moving Moon
        y = Math.sin((counter+180)*Math.PI/180) * R;
        x = Math.cos((counter+180)*Math.PI/180) * R;
        z = x;
        //moonLight.position.set(x + c, y, z);
        moon.position.set(x + c, y, z);
        if ((counter > 315) && (counter < 360) ) {
            // 360-315 45 = 100
            // 360-360 0
            // 360-counter ?
            // (360-counter)*100/45/100
            moon.material.opacity = (360-counter)*0.022;
            //log( counter +':'+ moon.material.opacity );
        } else if ( (counter>=0) && (counter < 100) ) {
            moon.material.opacity = 0;
        } else
            moon.material.opacity = 1;

        // moving Sun
        y = Math.sin(counter*Math.PI/180) * R;
        x = Math.cos(counter*Math.PI/180) * R;
        z = x;
        /*
        if (y < (-R/2))
            sunLight.visible = false
        else
            sunLight.visible = true;*/
        sun.position.set(x + c, y, z );
        //sunLight.position.set(x + c, y, z );
        //lensFlare.position = sun.position;

        // clear color changes
        //
        var r,g,b,hex;
        if (y < (-R/2)) y = (-R/2);
        y += (R/2);
        if (y > (R/1.5)) y = (R/1.5);
        per = ( y * 100)/(R/1.5);
        r = Math.round(255 * per / 100);
        r = r.toString(16);
        if (r.length<2) r = '0'+r;
        g = b = r;
        hex = "0x" + r.toString(16) + g.toString(16) + b.toString(16);
        hex = parseInt(hex);
        renderer.setClearColor( new THREE.Color(hex), 1 );

        // sun light changes
        //
        var h,s,l;
        y = sunLight.position.y;
        if (y<0) y = 0;
        per = (y*100)/R;
        h = (0.1 * per / 100)+0.05;
        l = (0.1 * per / 100)+0.85;
        s = ( 0.5 * per / 100)+0.5;
        sunLight.color.setHSL( h, s, l ); // 0.1, 1, 0.95

        // hemi light
        //
        /*y = sunLight.position.y;
        per = ((y+R)*100)/(R*2);
        //hemiLight.color.setHSL( 0.55, 0.75, 0.5 );
        //hemiLight.groundColor.setHSL( 0.095, 1, 0.1 ); // 0.095, 1, 0.75
        l = (1 * per / 100);
        hemiLight.color.setHSL( 0.55, 1, 1 );
        */

       ready = true;
    }

    __constructor(opt);
}

