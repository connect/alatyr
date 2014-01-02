var W6Db = function(){
    var t = this;

    var isAvaible = function(){
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    var __constructor = function(){
        if (isAvaible) {
            t.del = function(index){ delete localStorage[index]; }
            t.put = function(index,obj){
                try {
                    localStorage[index] = JSON.stringify(obj);
                } catch (e) {
                    log('Error writing to localStorage');
                    return false;
                    /*
                    if (e == QUOTA_EXCEEDED_ERR) {
                        return false;
                    }*/
                }
                return true;
            }
            t.get = function(index){
                var item = localStorage[index];
                if (item == undefined) return {}
                else return JSON.parse(item);
            }
        }
        else {
            t.del = t.put = t.get = function(){console.log('localStorage not supported')}
            t.del();
        }
    }

    __constructor();
}