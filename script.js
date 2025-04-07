document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const keywordInput = document.getElementById('keyword');
    const searchResultsContainer = document.getElementById('search-results');
    const jsonFilePath = 'worlds.json?20250406';
    let jsonData = []; // JSONデータを格納する変数

    // JSONデータの読み込み
    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            jsonData = data; // 読み込んだデータを格納
            displayResults(jsonData, searchResultsContainer); // 初期表示
        })
        .catch(error => {
            console.error('JSONデータの読み込みに失敗しました:', error);
            searchResultsContainer.textContent = 'データの読み込みに失敗しました。';
        });

    // 検索ボタンのイベントリスナー
    searchButton.addEventListener('click', () => {
        const keyword = keywordInput.value.toLowerCase();
        const results = searchData(jsonData, keyword);
        displayResults(results, searchResultsContainer);
    });

    // キーワード入力欄でのEnterキー押下時の検索
    keywordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    // データの検索を行う関数
    function searchData(data, keyword) {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.filter(item => {
            const searchTarget = [
                item.title,
                item.description,
                ...(Array.isArray(item.tags) ? item.tags : []) // tags が配列でない場合も考慮
            ];
            return searchTarget.some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(keyword);
                }
                return false;
            });
        });
    }

    // 検索結果をHTMLで表示する関数
    function displayResults(results, container) {
        container.innerHTML = ''; // 既存の結果をクリア
        if (results.length === 0) {
            container.textContent = '該当するデータは見つかりませんでした。';
            return;
        }

        const ul = document.createElement('ul');
        results.forEach(item => {
            const li = document.createElement('li');
            const tagsHtml = item.tags
                .map(tag => `<a href="#" class="tag-link" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`)
                .join(' ');
            li.innerHTML = `
        <h2>${escapeHtml(item.title)}</h2>
        <a href="${escapeHtml(item.worldlink)}" target="MIE">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="200"></a>
        <p>${escapeHtml(item.description)}</p>
        <p>${tagsHtml}</p>
      `;
            ul.appendChild(li);
        });
        container.appendChild(ul);

        // タグリンクのイベントリスナーを設定
        const tagLinks = container.querySelectorAll('.tag-link');
        tagLinks.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault(); // リンクのデフォルトの動作をPrevent
                const tag = this.dataset.tag; // data-tag属性からタグを取得
                keywordInput.value = tag; // 検索キーワード入力欄にタグを設定
                searchButton.click(); // 検索ボタンをクリック
            });
        });
    }

    // HTMLエスケープ関数（XSS対策）
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});