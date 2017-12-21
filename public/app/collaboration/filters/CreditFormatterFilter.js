angular.module('app.collaboration').filter('creditFormatterFilter', ['$filter', function($filter){
    var floorNumber = function(n, mul){
        return Math.round(n * mul) / mul;
    };

    return function(value){
        var floatValue = parseFloat(value);
        if(!_.isNaN(floatValue)){
            if(Math.abs(floatValue) % 1 >= 0.1){
                return (floorNumber(floatValue, 10)).toFixed(1);
            }
            return Math.floor(floatValue).toFixed(0);
        }else{
            return "n/a";
        }
    };
}]);
