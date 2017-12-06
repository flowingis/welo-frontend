angular.module('app.collaboration').filter('creditFormatterFilter', ['$filter', function($filter){
    var floorNumber = function(n, mul){
        var floor = Math.floor;
        if(n < 0){
            floor = Math.ceil;
        }
        return floor(n * mul) / mul;
    };

    return function(value){
        var floatValue = parseFloat(value);
        if(!_.isNaN(floatValue)){
            if(Math.abs(floatValue) % 1 >= 0.1){
                return (floorNumber(floatValue, 10)).toFixed(1);
            }else if(Math.abs(floatValue) % 1 >= 0.01){
                return (floorNumber(floatValue, 100)).toFixed(2);
            }
            return Math.floor(floatValue).toFixed(0);
        }else{
            return "n/a";
        }
    };
}]);
