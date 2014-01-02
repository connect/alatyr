W6Render = function(opt){
    var t = this;
    var ready = false;

    var __constructor = function(opt){
        ready = true;
    }

    t.update = function(){ //

    }

    t.render = function(){
        if (!ready)
            return
        else
            ready = false;

        // ...

        ready = true;
    }

    __constructor(opt);
}

