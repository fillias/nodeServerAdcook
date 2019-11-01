const shell = require('shelljs');
const path = require('path');

const mainDirectory = path.dirname(process.mainModule.filename);


const reportPath = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports');

/* shelljs chce v path z nejakyho duvodu lomitka escapovat */
 const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'reportDownloader.sh').replace(/\//g, '\\/');

// const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'test.sh').replace(/\//g, '\\/');





exports.getReport = (req, res, next) => {

    console.log('......... get report .........');
    //console.log(shellPath);

    //console.log(req.query.timing);

    const now = new Date();

    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() -1);

    let twoYearAgo = new Date();
    twoYearAgo.setFullYear(now.getFullYear() -2);

    let startDate, endDate;

    switch (req.query.action) {
        case 'oneYearAgo':
            // startDate = encodeURIComponent(toSasDate(oneYearAgo));
            // endDate = encodeURIComponent(toSasDate(now));

            /* mock, stahne jen jeden den */
            startDate = encodeURIComponent(toSasDate(now));
            endDate = encodeURIComponent(toSasDate(now));

            break;
        case 'twoYearAgo':
            // startDate = encodeURIComponent(toSasDate(twoYearAgo));
            // endDate = encodeURIComponent(toSasDate(oneYearAgo));

            /* mock, stahne jen jeden den */
            startDate = encodeURIComponent(toSasDate(now));
            endDate = encodeURIComponent(toSasDate(now));
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
           console.log('report downloader done');
            res.status(200).json({
                message: req.query.action
            });
        }
    });



}


function toSasDate(dateObj) {
    /* SAS reporty maji datum ve formatu 10/29/2018 */
        return `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}
    