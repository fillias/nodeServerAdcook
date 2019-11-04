const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const mainDirectory = path.dirname(process.mainModule.filename);


const reportPath = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports');

/* shelljs chce v path z nejakyho duvodu lomitka escapovat */
// const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'reportDownloader.sh').replace(/\//g, '\\/');


// testovaci sh script
const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'test.sh').replace(/\//g, '\\/');

let completed = {
    oneYearAgo: false,
    twoYearAgo: false
}




exports.getReport = (req, res, next) => {

    console.log('......... get report .........');

    const action = req.query.action;
    const reportType = req.query.reportType;

    const now = new Date();

    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() -1);

    let twoYearAgo = new Date();
    twoYearAgo.setFullYear(now.getFullYear() -2);

    let startDate, endDate;

    switch (action) {
        case 'completed':
            /* pokud se FE pta jestli je completed stazeni vrat jen stav a return */
            if (completed[reportType] === true) {
                res.status(200).json({
                    message: `${reportType}-completed`
                });

                /* setnem zpatky stav na false pro pristi requesty */
                completed[reportType] = false;
                return;
        
            } else if (completed[reportType] === 'jobId-failed') {
                /* pokud neco failne */
                res.status(200).json({
                    message: `jobId-failed`
                });

                /* setnem zpatky stav na false pro pristi requesty */
                completed[reportType] = false;
                return;
            }

            res.status(200).json({
                message: `${reportType}-pending`
            });
            return;

        case 'oneYearAgo':
            startDate = encodeURIComponent(toSasDate(oneYearAgo));
            endDate = encodeURIComponent(toSasDate(now));

            // mock, stahne jen jeden den 
            // startDate = encodeURIComponent(toSasDate(now));
            // endDate = encodeURIComponent(toSasDate(now));

            break;
        case 'twoYearAgo':
            startDate = encodeURIComponent(toSasDate(twoYearAgo));
            endDate = encodeURIComponent(toSasDate(oneYearAgo));

            // /* mock, stahne jen jeden den */
            // startDate = encodeURIComponent(toSasDate(now));
            // endDate = encodeURIComponent(toSasDate(now));
            break;
        default: 
            throw new Error('nesouhlasi query');
    }
    



    // console.log('startDate', startDate);
    // console.log('endDate', endDate);

    /* spustime shell script 
    prvni argument je jmeno reportu, druhy start date, treti end date    */
    let params = ` ${req.query.action} ${startDate} ${endDate}` ;


    const reportDownloader = shell.exec(shellPath + params, {
        async: true
    });

    /* v shell scriptu je na konci echo "downloaded" */
    reportDownloader.stdout.on('data', function (data) {   
      // console.log('>>> data', data, ' <<< data');    
        if (data.match('stazeno')) {
            /* jakmile je shell script hotov nastav true */
           console.log(`report ${action} downloader done`);
            completed[action] = true;
        }

        if (data.match('jobId-failed')) {
            /* jakmile je shell script hotov nastav true */
           console.log(`report ${action} jobId-failed`);
            completed[action] = `jobId-failed`;
        }
    });

    res.status(200).json({
        message: `${action}-pending`
    });


}


exports.downloadResult = (req, res, next) => {

    const cesta = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'result.csv');

     const file = fs.createReadStream(cesta);
     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
     res.setHeader('Content-Disposition', 'attachment; filename="result.csv"');

     file.pipe(res);

}




function toSasDate(dateObj) {
    /* SAS reporty maji datum ve formatu 10/29/2018 */
        return `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}
    