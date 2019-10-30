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
   var x = getApiResponse('/newByznys/getreport')
    .then(res => {
        progressContainer.style.display = 'none';
        resultContainer.innerText = res.message;
        resultContainer.style.display = 'block';
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
            resolve(resData);
        })
    })


           
}

