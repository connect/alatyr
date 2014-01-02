/**
 * Basic game object
 * 
 * @param {type} i input data
 * @returns {undefined}
 */
W6Object = function(i){
    var t = this;   
    t.id          = i.id;
    t.x           = i.x;
    t.y           = i.y;
    t.z           = i.z;
    t.temperature = 10;
    t.humidity    = 50;
    t.volume      = 0;
    t.mass        = 0;
    t.force       = [0,0,0]; // forces applied to object
    t.type        = i.type; // class
    t.gl          = []; // WebGL object links

    var __constructor = function(i){
        //
    }

    t.update = function(){ //
        //
    }

    __constructor(i);
}
