const shell = require('shelljs');
const path = require('path');

const mainDirectory = path.dirname(process.mainModule.filename);


const reportPath = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports');

/* shelljs chce v path z nejakyho duvodu lomitka escapovat */
const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'reportDownloader.sh').replace(/\//g, '\\/');

// const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'test.sh').replace(/\//g, '\\/');

console.log()
console.log(shellPath);

exports.getReport = (req, res, next) => {

    /* spustime shell script 
    prvni argument je api key, druhy start date, treti end date    */
    const reportDownloader = shell.exec(shellPath, {
        async: true
    });

    /* v shell scriptu je na konci echo "downloaded" */
    reportDownloader.stdout.on('data', function (data) {       
        if (data.trim() == 'downloaded') {
            res.status(200).json({
                message: data
            });
        }
    });



}