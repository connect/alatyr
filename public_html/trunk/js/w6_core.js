w_  = new W6World();
b_  = new W6Bio();
ai_ = new W6AI();
f_  = new W6Physics();
r_  = new W6Render();

var main = function(){
    window.requestAnimationFrame( main );
    if (!cfg.ready) return;
    //b_.update();
    //ai_.update();
    f_.update();
    r_.render();
}

main();

/*
var delay = window.setInterval(function(){
    if (cfg.ready) {
        window.clearInterval(delay);
        f_ = new W6Physics();
        r_ = new W6Render();
        window.requestAnimationFrame( main );
    }
},500);
*/