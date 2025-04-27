const omikujiImage = document.getElementById('omikuji_img');
const startButton = document.getElementById('startButton');
const resultDiv = document.getElementById('result');
const jsonFilePath = 'worlds.json?20250423';

let data = [];
let uranaicyu = false;
let spinTimeout;


async function loadWorlds() {
    try {
        const response = await fetch(jsonFilePath);
        data = await response.json();       
        omikujiImage.src = 'images/omikuji_start.png';
    } catch (error) {
        console.error('JSONファイルの読み込みエラー:', error);
        resultDiv.textContent = 'データの読み込みに失敗しました。';
    }
}

function startOmikuji() {
    if (uranaicyu) return;
    uranaicyu = true;
    omikujiImage.src = 'images/omikuji.gif';
    resultDiv.textContent = '';

    const randomIndex = Math.floor(Math.random() * data.length);
    const result = data[randomIndex];

    setTimeout(() => {
        displayResults(result, resultDiv);    
        omikujiImage.src = 'images/omikuji_end.png';
        uranaicyu = false;           
    }, 2500);
}


function displayResults(results, container) {
    container.innerHTML = ''; // 既存の結果をクリア

    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.innerHTML = `
        <h2>${escapeHtml(results.title)}</h2>
        <a href="${escapeHtml(results.worldlink)}" target="MIE">
        <img src="${escapeHtml(results.image)}" alt="${escapeHtml(results.title)}" width="200"></a>
        <p>${escapeHtml(results.description)}</p>
    `;
    ul.appendChild(li);
    container.appendChild(ul);
   
}


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

startButton.addEventListener('click', startOmikuji);

loadWorlds();