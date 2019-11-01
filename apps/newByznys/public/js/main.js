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
        return result;
    })
    .then(result => {
        resultContainer.innerText = "stahuju druhy report";
        console.log('druhy then', result.message);
        return getApiResponse('/newByznys/getreport?action=twoYearAgo')
    })
    .then(result => {
        resultContainer.innerText = "oboji stazeno";
        progressContainer.style.display = 'none';
        console.log('treti then', result);
        
    })
    .catch(err => console.log(err));
}


function getApiResponse (url) {

    return new Promise ((resolve, reject) => {
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

