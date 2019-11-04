const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const csvParse = require('csv-parse');

const mainDirectory = path.dirname(process.mainModule.filename);


const reportPath = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports');

/* shelljs chce v path z nejakyho duvodu lomitka escapovat */
// const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'reportDownloader.sh').replace(/\//g, '\\/');


// testovaci sh script
const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'test.sh').replace(/\//g, '\\/');


let completed = {
    oneYearAgo: false,
    twoYearAgo: false,
    csvProcessed: false,
    oneYearAgoLength : 0,
    twoYearAgoLength : 0
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

        /* FE se pta na stavy operaci */

        /* mame stazene reporty ze SAS? */
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


            /* mame dokoncene zprocesovani csv? */
            case 'csv-process':
                /* pokud se FE pta jestli je completed stazeni vrat jen stav a return */
                if (completed.csvProcessed === true) {
                    completed.csvProcessed = false;
                    res.status(200).json({
                        message: `csv-process-completed`
                    });
    
                    /* setnem zpatky stav na false pro pristi requesty */
                    completed.csvProcessed = false;
                    return;
            
                }
    
                res.status(200).json({
                    message: `csv-process-pending`,
                    oneYearAgoLength: completed.oneYearAgoLength,
                    twoYearAgoLength: completed.twoYearAgoLength
                });
                return;
 
                
        /* stahni pozadovany report */
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


exports.processCsv = (req, res, next) => {
    /* vratime odpoved ze na tom makam */

    res.status(200).json({
        message: `csv-process-pending`
    });

    /* !!!! cpu a time heavy operace */
   zpracujCsv();
}


function zpracujCsv () {

    const csvTwoYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'twoYearAgo.csv');

    const csvOneYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'oneYearAgo.csv');

    // vytahneme z twoYearAgo.csv advertisery (jsou jako 4. sloupec)
    let oldAdvertisers = []
    let oneYearAgo = [];

    fs.createReadStream(csvTwoYearAgo)
    .pipe(csvParse())
    .on('data', (row) => {
       // console.log(row[3]);
        oldAdvertisers.push(row[3]);
    })
    .on('end', () => {
       // console.log(oldAdvertisers);
       // console.log(`csvTwoYearAgo hotovo`);


        // loadnem oneYearAgo.csv
        fs.createReadStream(csvOneYearAgo)
        .pipe(csvParse())
        .on('data', (row) => {
          // console.log(row.join(','));
            oneYearAgo.push(row.join(','));
        })
        .on('end', () => {
         //  console.log(oneYearAgo);
          //  console.log(`csvOneYearAgo hotovo`);
            completed.oneYearAgoLength = oneYearAgo.length;
            completed.twoYearAgoLength = oldAdvertisers.length;

            /* mock cpu heavy operation */
            setTimeout(_ => {
                completed.csvProcessed = true;
            }, 40000);

            /* test */
            saveToFile(oneYearAgo);
          /* !!!! cpu a time heavy operace */
         // deleteOldByznys(oldAdvertisers, oneYearAgo);
        });


    });
}


exports.downloadResult = (req, res, next) => {

    const cesta = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'result.csv');

     const file = fs.createReadStream(cesta);
     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
     res.setHeader('Content-Disposition', 'attachment; filename="result.csv"');

     file.pipe(res);

}


function deleteOldByznys (oldAdvertisers, oneYearAgo) {
    console.log(oneYearAgo.length);
    let counter = 1;
    const result = oneYearAgo.filter(entry => {
     //   console.log('--------', entry);
      //  console.log(`--${counter}--`);
        const found = oldAdvertisers.find(advertiser => {
            if (entry.search(advertiser) != -1) {
                return advertiser;
            } 
        });
        /* pokud advertisera nenajde, vrat true */
        counter++;
        return found == undefined ? true : false;

    })
    
    console.log(result.length);
    // todo
    saveToFile(result);

}


function saveToFile(arr) {
    // todo
    // const result = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'result.csv');

    // fs.createWriteStream(cesta)
    // .pipe(csvParse())
    // .on('data', (row) => {
    //   csvParse.write(row);
    // })
    // .on('end', () => {
    //   console.log('end');
    // });
}


function toSasDate(dateObj) {
    /* SAS reporty maji datum ve formatu 10/29/2018 */
        return `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}
    