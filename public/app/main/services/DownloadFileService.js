var DownloadFileService = function() {
    var fixed = function(val){
        return (val>9 ? '' : '0') + val;
    };

    return function(data, fileName, fileExtension){
        var now = new Date();
        var mm = now.getMonth() + 1;
        var dd = now.getDate();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();
        var nowFormatted = now.getFullYear()+fixed(mm)+fixed(dd)+"_"+fixed(h)+fixed(m)+fixed(s);
        var fileNameWithDate = fileName+"_"+nowFormatted+fileExtension;
        var blobTypes = {
            ".csv": 'text/csv;charset=utf8;',
            ".pdf": 'application/pdf'
        };
        var blob = new Blob([data], {
            type: blobTypes[fileExtension]
        });

        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, fileNameWithDate);
        } else {
            var element = document.createElement('a');
            document.body.appendChild(element);
            element.setAttribute('href', window.URL.createObjectURL(blob));
            element.setAttribute('download', fileNameWithDate);
            element.style.display = '';
            element.click();
            document.body.removeChild(element);
        }
    };
};

angular.module('app').service('downloadFileService', [DownloadFileService]);
