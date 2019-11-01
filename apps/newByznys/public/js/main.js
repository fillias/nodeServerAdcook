const loadBtn = document.getElementById('btn-load-report');
const progressContainer = document.getElementById('progress-info-container');
const progresText = document.getElementById('progress-info');
const resultContainer = document.getElementById('result');

let clicked = false;

loadBtn.addEventListener('click', () => {
    loadBtn.style.display = 'none';
    progressContainer.style.display = 'block';

    getReport();
    clicked = true;
});

var x = false;
setTimeout(() => {
    x = true;
}, 15000);

function getReport() {
    /* funkce se spousti na klik na FE 
     ** v query je akce kterou chceme
     ** poradi je: 
     ** stahni report za poslednich 365 dnu
     ** stahni report starsi nez 365 dnu
     ** nech vypocitat vysledek
     ** nech stahnout vysledne csv
     */


    resultContainer.innerText = "stahuju prvni report";
    resultContainer.style.display = 'block';

    getApiResponse('/newByznys/getreport?action=oneYearAgo')
        .then(result => {
            console.log('prvni then', result);
            return checkDownloadingStatus('oneYearAgo');
        })
        .then(result => {
            console.log('druhy then', result);
            getApiResponse('/newByznys/getreport?action=twoYearAgo')
            resultContainer.innerText = "stahuju druhy report";           
        })
        .then(result => {
            console.log('treti then', result);
            return checkDownloadingStatus('twoYearAgo');
        }).then(result => {
            console.log('ctvrty then', result);
            resultContainer.innerText = "oboji stazeno";
            progressContainer.style.display = 'none';

        }).catch(err => console.log(err));

}


async function checkDownloadingStatus(action) {
    const result = await new Promise((resolve, reject) => {
        var timer = setInterval(() => {
            //console.log('timer', timer);
            getApiResponse(`/newByznys/getreport?action=completed&reportType=${action}`)
                .then(result => {
                    console.log('checkDownloadingStatus result', result);
                    if (result.message === `${action}-completed`) {
                        clearInterval(timer);
                        resolve(`${action}-completed`);
                    }
                })
                .catch(err => {
                    console.log(err)
                });
        }, 5000);
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