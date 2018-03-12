angular.module('app.collaboration').filter('creditFormatterFilter', ['$filter', function($filter){

    var floorNumber = function(n, mul){
        return Math.round(n * mul) / mul;
    };

    var toFixed1 = function(floatValue){
        var sufix = "";
        if(floatValue < 0){
            sufix = "-";
        }
        return sufix+(Math.abs(floorNumber(floatValue, 10))).toFixed(1);
    };

    var removeZeroDecimal = function(numStr){
        return numStr.replace('.0', '');
    };

    return function(value){
        var floatValue = parseFloat(value);
        if(!_.isNaN(floatValue)){
            var valueWithoutZeroDecimal = removeZeroDecimal(toFixed1(floatValue));
            return parseFloat(valueWithoutZeroDecimal).toLocaleString("it-IT");
        }else{
            return "n/a";
        }
    };
}]);
