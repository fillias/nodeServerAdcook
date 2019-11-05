const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const csvParse = require('csv-parse');


const mainDirectory = path.dirname(process.mainModule.filename);

const csvResultPath = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'result.csv');
const csvTwoYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'twoYearAgo.csv');
const csvOneYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'oneYearAgo.csv');

/* testing */
// const csvTwoYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'testtwoYearAgo.csv');
// const csvOneYearAgo = path.join(mainDirectory, 'apps', 'newByznys', 'downloadedReports', 'testoneYearAgo.csv');



/* shelljs chce v path z nejakyho duvodu lomitka escapovat */
// const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'reportDownloader.sh').replace(/\//g, '\\/');

// testovaci sh script
const shellPath = path.join(mainDirectory, 'apps', 'newByznys', 'shell', 'test.sh').replace(/\//g, '\\/');


let completed = {
    oneYearAgo: false,
    twoYearAgo: false,
    csvProcessed: false,
    oneYearAgoLength: 0,
    twoYearAgoLength: 0
}


exports.resetState = (req, res, next) => {
    /* resetni stav a smaz vstupy a vystupy */

    completed.oneYearAgo = false;
    completed.twoYearAgo = false;
    completed.csvProcessed = false;
    completed.oneYearAgoLength = 0;
    completed.twoYearAgoLength = 0;

    try {
        fs.writeFileSync(csvResultPath, 'reset: ' + new Date());
        // fs.writeFileSync(csvOneYearAgo, 'reset');
        // fs.writeFileSync(csvTwoYearAgo, 'reset');
        console.log('-- reset --');
    } catch (err) {
        console.error(err);
    }
    res.status(200).json({
        message: `backend status reseted`
    });
}




exports.getReport = (req, res, next) => {
    /* hlavni fce co se zavola na klik na "loadni report", dale dle query */


    console.log('......... get report .........');

    const action = req.query.action;
    const reportType = req.query.reportType;

    const now = new Date();

    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    let twoYearAgo = new Date();
    twoYearAgo.setFullYear(now.getFullYear() - 2);

    let startDate, endDate;

    switch (action) {

        /* FE se pta na stavy operaci nebo s pozadavkem na stazeni reportu
         ** pokud je v query action "completed" nebo "csvprocess" tak vrat stav v jakem to je return.
         ** pokud neni v query dotaz na stav zacni stahovat reporty dle pozadavku v query
         */

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

    /* spustime shell script, ten zaridi stahnuti reportu "performance" pomoci SAS API
    prvni argument je jmeno reportu, druhy start date, treti end date    */
    let params = ` ${req.query.action} ${startDate} ${endDate}`;


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




    zpracujCsv()
        .then((resolved) => {
            completed.oneYearAgoLength = resolved.oneYearAgo.length;
            completed.twoYearAgoLength = resolved.oldAdvertisers.length;

            console.log(completed.twoYearAgoLength);
            res.status(200).json({
                message: `csv-process-pending`,
                oneYearAgoLength: completed.oneYearAgoLength,
                twoYearAgoLength: completed.twoYearAgoLength
            });

            /* !!!! cpu a time heavy operace */
            /* mock cpu heavy operation */
            // setTimeout(_ => {
            //     completed.csvProcessed = true;
            // }, 40000);

             deleteOldByznys(resolved.oldAdvertisers, resolved.oneYearAgo);
        }).catch(e => console.log(e));;
}


function zpracujCsv() {

    return new Promise((resolve, reject) => {
        // vytahneme z twoYearAgo.csv advertisery (jsou jako 4. sloupec)
        let oldAdvertisers = []
        let oneYearAgo = [];

        fs.createReadStream(csvTwoYearAgo)
            .pipe(csvParse())
            .on('data', (row) => {
                // console.log(row[3]);
                oldAdvertisers.push(row[3]);
            })
            .on('error', (err) => {
                reject(err);
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
                        // console.log(oneYearAgo);
                        //  console.log(`csvOneYearAgo hotovo`);
                        resolve({oldAdvertisers, oneYearAgo});
                    });
            });

    })


}



function deleteOldByznys(oldAdvertisers, oneYearAgo) {

    /* mock */
    // saveToFile(oneYearAgo);
    // return;

    /* !!!! cpu a time heavy operace */

    //console.log(oneYearAgo.length);
    const result = oneYearAgo.filter(entry => {
        //   console.log('--------', entry);
        //  console.log(`--${counter}--`);
        const found = oldAdvertisers.find(advertiser => {
            if (entry.search(advertiser) != -1) {
                return advertiser;
            }
        });
        /* pokud advertisera nenajde, vrat true */
        return found == undefined ? true : false;

    })

    // console.log(result.length);
    // sejvni report, druhy argument je zahlavi (funkce ho smaze)
    saveToFile(result, oneYearAgo[0]);

}


function saveToFile(result, zahlavi) {

    const file = fs.createWriteStream(csvResultPath);
    file.on('error', function (err) {
        /* error handling */
    });

    file.on('finish', function () {
        console.log('zapsano');
        completed.csvProcessed = true;
    });

    file.write(zahlavi + '\n');
    result.forEach(function (row) {
        // console.log(row)
        file.write(row + '\n');
    });
    file.end();

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