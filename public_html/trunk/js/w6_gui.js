var W6Gui = function() {
    var t = this;

    var __constructor = function(){
        t.coords = document.createElement('div');
        t.coords.id = 'coords';
        t.coords.innerHTML = 'X: 0, Z: 0';
        container.appendChild( t.coords );

        t.state = document.createElement('div');
        t.state.id = 'state';
        t.state.innerHTML = 'Standing';
        container.appendChild( t.state );
        
        t.locations = document.createElement('div');
        t.locations.id = 'locations';
        t.locations.innerHTML = '0';
        container.appendChild( t.locations );
    }

    t.update = function(){
        // char state update
        t.state.innerHTML = controls.getState();
        
        // number of loaded locations
        t.locations.innerHTML = 'Locations: '+Location.count;
    }

    __constructor();
}
