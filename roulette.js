const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');
const jsonFilePath = 'worlds.json?20250428';

let jsonData = [];
let angle = 0;
let spinning = false;
let spinTimeout;
const friction = 0.99; // 減速率
let spinSpeed = 0;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY) - 20;

const colors = ['#ffc300', '#ff5e63', '#ff2693', '#ba00a2', '#2c00d9']; // 使用する色の配列（16進数カラーコード）
let colorIndex = 0; // 現在の色のインデックス
const targetTags = ['バイオーム'];


async function loadWorlds() {
    try {
        const response = await fetch(jsonFilePath);
        let data = [];
        data = await response.json();
        jsonData = searchData(data, targetTags);

        // 各ワールドデータに色を追加
        jsonData.forEach(world => {

            //world.color = getRandomColor();
            if (colorIndex < colors.length)
            { }
            else
            {
                colorIndex = 0;
            }
            const currentColor = colors[colorIndex % colors.length]; // 現在の色を取得（配列の長さを超えないように剰余演算子を使用）
            world.color = currentColor;
            colorIndex++;
        });
        drawRoulette();
    } catch (error) {
        console.error('JSONファイルの読み込みエラー:', error);
        resultDiv.textContent = 'データの読み込みに失敗しました。';
    }
}

// タグに「バイオーム」が含まれていないものを抽出
function searchData(data, keywords) {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.filter(item => {
        const searchTarget = [
            ...(Array.isArray(item.tags) ? item.tags : []) // tags が配列でない場合も考慮
        ].map(value => typeof value === 'string' ? value.toLowerCase() : ''); // 検索対象を小文字に変換

        // すべてのキーワードが検索対象のいずれかの項目に含まれていないか確認
        return !keywords.some(keyword =>
            searchTarget.some(value => value.includes(keyword))
        );
    });
}

function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (jsonData.length === 0) return;

    const numSegments = jsonData.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    jsonData.forEach((world, index) => {
        const startAngle = angle + index * anglePerSegment;
        const endAngle = angle + (index + 1) * anglePerSegment;
        const segmentAngle = startAngle + anglePerSegment / 2;

        // 扇形を描画
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = world.color;
        ctx.fill();
        ctx.stroke(); // 境界線

        // テキストを描画
        ctx.save();
        ctx.translate(centerX + Math.cos(segmentAngle) * (radius * 0.7), centerY + Math.sin(segmentAngle) * (radius * 0.7));
        ctx.rotate(segmentAngle); // テキストを円の外側に向ける
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(world.title, 0, 0);
        ctx.restore();
    });

    // 針を描画
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 10, centerY - radius - 25);
    ctx.lineTo(centerX + 10, centerY - radius - 25);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
}

function spin() {
    if (spinning) return;
    spinning = true;
    spinSpeed = Math.random() * 0.2 + 0.1; // 初期スピン速度
    resultDiv.textContent = '';
    animate();
}

function animate() {
    angle += spinSpeed;
    spinSpeed *= friction;

    drawRoulette();

    if (spinSpeed < 0.005) {
        spinning = false;
        determineWinner();
    } else {
        requestAnimationFrame(animate);
    }
}

function determineWinner() {
    if (jsonData.length === 0) return;
    const numSegments = jsonData.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    // 矢印が指す角度 (真上を基準とする場合)
    const arrowAngle = Math.PI * 1.5; // -90度

    // 停止時の角度を矢印の基準に合わせる
    const normalizedAngle = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
    const rawWinningIndex = Math.floor(normalizedAngle / anglePerSegment);

    // 調整: 矢印の角度を考慮して当選インデックスを計算
    let winningSegmentIndex = Math.floor((arrowAngle - (angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / anglePerSegment) % numSegments;

    //resultDiv.textContent = `当たり: ${data[winningSegmentIndex].title}`;
    displayResults(jsonData[winningSegmentIndex], resultDiv);
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

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

spinButton.addEventListener('click', spin);

loadWorlds();