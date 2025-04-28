const omikujiImage = document.getElementById('omikuji_img');
const startButton = document.getElementById('startButton');
const resultDiv = document.getElementById('result');
const jsonFilePath = 'worlds.json?20250428';
const targetTags = ['バイオーム'];

let jsonData = [];
let uranaicyu = false;
let spinTimeout;


async function loadWorlds() {
    try {
        const response = await fetch(jsonFilePath);
        let data = [];
        data = await response.json();       

        jsonData = searchData(data, targetTags);
        omikujiImage.src = 'images/omikuji_start.png';
    } catch (error) {
        console.error('JSONファイルの読み込みエラー:', error);
        resultDiv.textContent = 'データの読み込みに失敗しました。';
    }
}

    // タグに「バイオーム」が含まれているものを抽出
    function searchData(data, keywords) {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.filter(item => {
            const searchTarget = [
                ...(Array.isArray(item.tags) ? item.tags : []) // tags が配列でない場合も考慮
            ].map(value => typeof value === 'string' ? value.toLowerCase() : ''); // 検索対象を小文字に変換

            // すべてのキーワードが検索対象のいずれかの項目に含まれているか確認
            return keywords.every(keyword =>
                searchTarget.some(value => value.includes(keyword))
            );
        });
    }


function startOmikuji() {
    if (uranaicyu) return;
    uranaicyu = true;
    omikujiImage.src = 'images/omikuji.gif';
    resultDiv.textContent = '';

    const randomIndex = Math.floor(Math.random() * jsonData.length);
    const result = jsonData[randomIndex];

    setTimeout(() => {
        omikujiImage.src = 'images/omikuji_end.png';
        uranaicyu = false;           
        setTimeout(() => {
            displayResults(result, resultDiv);    
        }, 500);
    }, 1400);
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