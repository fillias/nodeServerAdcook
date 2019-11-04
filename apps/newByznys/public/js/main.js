const newByznys = (function () {

    const loadBtn = document.getElementById('btn-load-report');
    const progressContainer = document.getElementById('progress-info-container');
    const progresText = document.getElementById('progress-info');
    const resultContainer = document.getElementById('result');
    const progressCounter = document.getElementById('progress-info-container-counter');
    const downloadBtn = document.getElementById('btn-download-result');

    const testCsvBtn = document.getElementById('testCsv');



    loadBtn.addEventListener('click', () => {
        loadBtn.style.display = 'none';
        progressContainer.style.display = 'block';
        getReport();
    });

    downloadBtn.addEventListener('click', () => {
        downloadFile('/newByznys/downloadresult', 'result.csv')
    });



    function getReport() {
        /* funkce se spousti na klik na FE 
         ** v query je akce kterou chceme
         ** poradi je: 
         ** stahni report za poslednich 365 dnu
         ** stahni report starsi nez 365 dnu
         ** nech vypocitat vysledek
         ** nech stahnout vysledne csv
         */


        resultContainer.innerHTML = "Stahuju prvni report - cekam na odpoved.";
        resultContainer.style.display = 'block';

        getApiResponse('/newByznys/getreport?action=oneYearAgo')
            .then(result => {
                console.log('prvni then', result);
                return checkDownloadingStatus('oneYearAgo');
            })
            .then(result => {
                console.log('druhy then', result);
                if (result === 'jobId-failed') {
                    throw new Error('jobId-failed - missing jobID');
                }
                progressCounter.innerHTML = '';
                console.log('druhy then', result);
                resultContainer.innerText = "Stahuju druhy report - cekam na odpoved.";
                getApiResponse('/newByznys/getreport?action=twoYearAgo')

            })
            .then(result => {
                console.log('treti then', result);
                return checkDownloadingStatus('twoYearAgo');
            }).then(result => {
                console.log('ctvrty then', result);

                if (result === 'jobId-failed') {
                    throw new Error('jobId-failed - missing jobID');
                }

                resultContainer.innerText = "oboji stazeno, pocitam vysledne csv";
                progressCounter.innerHTML = '';
                /* kdyz je stazeno, zacni procesovat csv */
                return processCsv();
            }).then(result => {
                /* zde mame vse hotovo */
                progressContainer.style.display = 'none';
                progressCounter.innerHTML = 'VSE hotovo';
                console.log(result);

            }).catch(err => {
                resultContainer.innerText = "Chyba - kontaktuj support";
                progressContainer.style.display = 'none';
                progressCounter.innerHTML = '';
                console.log(err)
            });

    }

    /* kazdych 11sec se dotaz jestli je report ze SAS stazeny */
    async function checkDownloadingStatus(action) {
        const result = await new Promise((resolve, reject) => {
            let counter = 1;
            let nazev = action === 'oneYearAgo' ? 'Prvni' : 'Druhy';
            var timer = setInterval(() => {

                //console.log('timer', timer);
                getApiResponse(`/newByznys/getreport?action=completed&reportType=${action}`)
                    .then(result => {
                        console.log('checkDownloadingStatus result', result);

                        if (result.message === 'jobId-failed') {
                            clearInterval(timer);
                            resolve(`jobId-failed`);
                        }

                        if (result.message === `${action}-completed`) {
                            clearInterval(timer);
                            counter = 1;
                            resolve(`${action}-completed`);
                        }

                        progressCounter.innerHTML = `${nazev} report ve fronte - pokus cislo: <strong>${counter}</strong>`;
                        counter++;

                    })
                    .catch(err => {
                        console.log(err)
                    });
            }, 11000);
        });

        return result;
    }



    function processCsv () {
        return new Promise ((resolve, reject) => {
            getApiResponse('/newByznys/process-csv')
            .then(result => {
                console.log(result);
            })
            .then(result => {
               resolve( checkProcessingStatus() );
               
            })
            .catch(e => console.log(e));
        })
    }

    /* kazdych 11sec se dotaz jestli je csv zpracovano */
    async function checkProcessingStatus() {
        const result = await new Promise((resolve, reject) => {
            let counter = 1;
            var timer = setInterval(() => {

                //console.log('timer', timer);
                getApiResponse(`/newByznys/getreport?action=csv-process`)
                    .then(result => {
                        console.log('checkDownloadingStatus result', result);


                        if (result.message === `csv-process-completed`) {
                            clearInterval(timer);
                            counter = 1;
                            resolve(`csv-process-completed`);
                        }
                        progressCounter.innerHTML = `
                            Pocet radku v reportu za poslednich 365 dnu: ${result.oneYearAgoLength}<br>
                            Pocet radku v reportu se starsimi zaznamy: ${result.twoYearAgoLength}<br>
                            Cekam na zpracovani vysledneho csv - pokus cislo: <strong>${counter}</strong>`;
                        counter++;

                    })
                    .catch(err => {
                        console.log(err)
                    });
            }, 11000);
        });

        return result;
    }


    function getApiResponse(url) {

        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => {
                    if (res.status !== 200) {
                        throw new Error('res not 200');
                    }
                    return res.json();
                }).then(resData => {
                    // console.log('resolve resData');
                    resolve(resData);
                })
        })

    }

    function downloadFile(url, filename) {
        /*  downloadjs http://danml.com/download.html */
        return fetch(url, {
            method: 'GET',
            headers: {}
        }).then(function (resp) {
            return resp.blob();
        }).then(function (blob) {
            download(blob, filename);
        });
    }





})();