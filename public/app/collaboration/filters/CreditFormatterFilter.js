angular.module('app.collaboration').filter('creditFormatterFilter', ['$filter', function($filter){
    var floorNumber = function(n){
        var floor = Math.floor;
        if(n < 0){
            floor = Math.ceil;
        }
        return floor(n * 10) / 10;
    };

    return function(value){
        var floatValue = parseFloat(value);
        if(!_.isNaN(floatValue)){
            if(Math.abs(floatValue) % 1 >= 0.1){
                return (floorNumber(floatValue)).toFixed(1);
            }
            return Math.floor(floatValue).toFixed(0);
        }else{
            return "n/a";
        }
    };
}]);
