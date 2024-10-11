// ユーザーの入力を取得
const prefecture = localStorage.getItem('prefecture') || '不明';
const gender = localStorage.getItem('gender') || '不明';
const birthdate = localStorage.getItem('birthdate') || '不明';
const age = calculateAge(birthdate); // 年齢を計算する関数を追加

// 年齢を計算する関数
function calculateAge(birthdate) {
    if (!birthdate) return 0; // 生年月日がない場合は0歳
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}


// 年齢範囲を決定する関数
function getAgeRange(age) {
    if (age >= 40 && age <= 44) {
        return '40～44歳';
    } else if (age >= 45 && age <= 49) {
        return '45～49歳';
    } else if (age >= 50 && age <= 54) {
        return '50～54歳';
    } else if (age >= 55 && age <= 59) {
        return '55～59歳';
    } else if (age >= 60 && age <= 64) {
        return '60～64歳';
    } else if (age >= 65 && age <= 69) {
        return '65～69歳';
    } else if (age >= 70 && age <= 74) {
        return '70～74歳';
    } else {
        return '不明な年齢範囲';
    }
}

// 比較メッセージを生成する
const ageRange = getAgeRange(age);
const comparisonMessage = `${prefecture}かつ${gender}かつ${ageRange}との比較`;
document.getElementById('comparisonMessage').textContent = comparisonMessage;


const maxBloodPressure = parseInt(localStorage.getItem('maxBloodPressure')) || 0;
const minBloodPressure = parseInt(localStorage.getItem('minBloodPressure')) || 0;
const triglycerides = parseInt(localStorage.getItem('triglycerides')) || 0;
const hdl = parseInt(localStorage.getItem('hdl')) || 0;
const ldl = parseInt(localStorage.getItem('ldl')) || 0;
const hba1c = parseFloat(localStorage.getItem('hba1c')) || 0;
const fastingBloodSugar = parseInt(localStorage.getItem('fastingBloodSugar')) || 0;


// 基準値
const standards = {
    maxBloodPressure: { normal: 120, caution: 139, abnormal: 140 },
    minBloodPressure: { normal: 80, caution: 89, abnormal: 90 },
    triglycerides: { normal: 150, caution: 199, abnormal: 200 },
    hdl: { normal: 60, caution: 59, abnormal: 39 },
    ldl: { normal: 100, caution: 159, abnormal: 160 },
    hba1c: { normal: 5.6, caution: 6.4, abnormal: 6.5 },
    fastingBloodSugar: { normal: 99, caution: 125, abnormal: 126 }
};

// CSVデータを取得する関数
async function fetchData() {
    const response = await fetch('open_data/data/拡張期血圧.csv');
    const data = await response.text();
    return parseCSV(data);
}

// CSVを解析する関数
function parseCSV(data) {
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    const result = [];

    for (let i = 1; i < rows.length; i++) {
        const obj = {};
        const values = rows[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = values[j].trim();
        }
        result.push(obj);
    }
    return result;
}

// 入力されたユーザー情報に基づいてデータをフィルタリングする関数
function filterData(data, prefecture, gender, ageRange) {
    return data.filter(item => 
        item.prefecture === prefecture && 
        item.gender === gender && 
        item.ageRange === ageRange
    );
}

// ヒストグラムを描画する関数
function drawHistogram(ctx, filteredData, label) {
    const values = filteredData.map(item => parseInt(item[label]));
    const histogramData = {};

    // ヒストグラムデータの生成
    values.forEach(value => {
        histogramData[value] = (histogramData[value] || 0) + 1;
    });

    // ヒストグラム描画のためのデータ準備
    const labels = Object.keys(histogramData);
    const data = Object.values(histogramData);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${label}のヒストグラム`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// メイン処理
(async function() {
    const data = await fetchData();
    const prefecture = localStorage.getItem('prefecture') || '不明';
    const gender = localStorage.getItem('gender') || '不明';
    const birthdate = localStorage.getItem('birthdate') || '不明';
    const age = calculateAge(birthdate);
    const ageRange = getAgeRange(age);
    
    // フィルタリング
    const filteredData = filterData(data, prefecture, gender, ageRange);

    // ヒストグラムを描画
    drawHistogram(document.getElementById('maxBloodPressureHistogram').getContext('2d'), filteredData, 'maxBloodPressure');
    drawHistogram(document.getElementById('minBloodPressureHistogram').getContext('2d'), filteredData, 'minBloodPressure');
    drawHistogram(document.getElementById('triglyceridesHistogram').getContext('2d'), filteredData, 'triglycerides');
    drawHistogram(document.getElementById('hdlHistogram').getContext('2d'), filteredData, 'hdl');
    drawHistogram(document.getElementById('ldlHistogram').getContext('2d'), filteredData, 'ldl');
    drawHistogram(document.getElementById('hba1cHistogram').getContext('2d'), filteredData, 'hba1c');
    drawHistogram(document.getElementById('fastingBloodSugarHistogram').getContext('2d'), filteredData, 'fastingBloodSugar');
})();

























// グラフを描画する関数
function createChart(ctx, userScore, normal, caution, abnormal, label) {
    const data = {
        labels: [label],
        datasets: [
            {
                label: '自分のスコア',
                data: [userScore],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                type: 'bar'
            },
            {
                label: '基準値 (正常)',
                data: [normal],
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                type: 'line'
            },
            {
                label: '基準値 (要注意)',
                data: [caution],
                backgroundColor: 'rgba(255, 255, 0, 0.3)',
                type: 'line'
            },
            {
                label: '基準値 (異常)',
                data: [abnormal],
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                type: 'line'
            },
        ]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: Math.max(Math.round(abnormal + 10), Math.round(abnormal * 1.2)) // 基準値よりも少し高く設定
                }
            }
        }
    });
}

// 各項目ごとにグラフを作成
createChart(document.getElementById('maxBloodPressureChart').getContext('2d'), maxBloodPressure, standards.maxBloodPressure.normal, standards.maxBloodPressure.caution, standards.maxBloodPressure.abnormal, '最大血圧');
createChart(document.getElementById('minBloodPressureChart').getContext('2d'), minBloodPressure, standards.minBloodPressure.normal, standards.minBloodPressure.caution, standards.minBloodPressure.abnormal, '最小血圧');
createChart(document.getElementById('triglyceridesChart').getContext('2d'), triglycerides, standards.triglycerides.normal, standards.triglycerides.caution, standards.triglycerides.abnormal, '中性脂肪');
createChart(document.getElementById('hdlChart').getContext('2d'), hdl, standards.hdl.normal, standards.hdl.caution, standards.hdl.abnormal, 'HDL-C');
createChart(document.getElementById('ldlChart').getContext('2d'), ldl, standards.ldl.normal, standards.ldl.caution, standards.ldl.abnormal, 'LDL-C');
createChart(document.getElementById('hba1cChart').getContext('2d'), hba1c, standards.hba1c.normal, standards.hba1c.caution, standards.hba1c.abnormal, 'HbA1c');
createChart(document.getElementById('fastingBloodSugarChart').getContext('2d'), fastingBloodSugar, standards.fastingBloodSugar.normal, standards.fastingBloodSugar.caution, standards.fastingBloodSugar.abnormal, '空腹時血糖');

// 簡単なアドバイスを表示
const adviceElement_HBP = document.getElementById('advice_HBP');
const adviceElement_HL = document.getElementById('advice_HL');
const adviceElement_DM = document.getElementById('advice_DM');

if (maxBloodPressure > standards.maxBloodPressure.abnormal) {
    adviceElement_HBP.innerHTML += '<p>最大血圧が異常です。医師に相談してください。</p>';
} else if (maxBloodPressure > standards.maxBloodPressure.caution) {
    adviceElement_HBP.innerHTML += '<p>最大血圧が要注意です。健康管理に気をつけましょう。</p>';
}else {
    adviceElement_HBP.innerHTML += '<p>最大血圧は正常です。健康を維持しましょう。</p>';
}

if (minBloodPressure < standards.minBloodPressure.abnormal) {
    adviceElement_HBP.innerHTML += '<p>最小血圧が異常です。医師に相談してください。</p>';
} else if (minBloodPressure > standards.minBloodPressure.caution) {
    adviceElement_HBP.innerHTML += '<p>最小血圧が要注意です。健康管理に気をつけましょう。</p>';
} else {
    adviceElement_HBP.innerHTML += '<p>最小血圧は正常です。健康を維持しましょう。</p>';
}

if (triglycerides > standards.triglycerides.abnormal) {
    adviceElement_HL.innerHTML += '<p>中性脂肪が異常です。医師に相談してください。</p>';
} else if (triglycerides > standards.triglycerides.caution) {
    adviceElement_HL.innerHTML += '<p>中性脂肪が要注意です。食生活を見直しましょう。</p>';
} else {
    adviceElement_HL.innerHTML += '<p>中性脂肪は正常です。健康を維持しましょう。</p>';
}
if (hdl < standards.hdl.abnormal) {
    adviceElement_HL.innerHTML += '<p>HDL-Cが異常です。医師に相談してください。</p>';
} else if (hdl < standards.hdl.caution) {
    adviceElement_HL.innerHTML += '<p>HDL-Cが要注意です。運動を増やしましょう。</p>';
} else {
    adviceElement_HL.innerHTML += '<p>HDL-Cは正常です。引き続き健康を維持しましょう。</p>';
}
if (ldl > standards.ldl.abnormal) {
    adviceElement_HL.innerHTML += '<p>LDL-Cが異常です。医師に相談してください。</p>';
} else if (ldl > standards.ldl.caution) {
    adviceElement_HL.innerHTML += '<p>LDL-Cが要注意です。食事を見直しましょう。</p>';
} else {
    adviceElement_HL.innerHTML += '<p>LDL-Cは正常です。健康を維持しましょう。</p>';
}


if (hba1c > standards.hba1c.abnormal) {
    adviceElement_DM.innerHTML += '<p>HbA1cが異常です。医師に相談してください。</p>';
} else if (hba1c > standards.hba1c.caution) {
    adviceElement_DM.innerHTML += '<p>HbA1cが要注意です。健康管理に気をつけましょう。</p>';
} else {
    adviceElement_DM.innerHTML += '<p>HbA1cは正常です。引き続き健康を維持しましょう。</p>';
}
if (fastingBloodSugar > standards.fastingBloodSugar.abnormal) {
    adviceElement_DM.innerHTML += '<p>空腹時血糖が異常です。医師に相談してください。</p>';
} else if (fastingBloodSugar > standards.fastingBloodSugar.caution) {
    adviceElement_DM.innerHTML += '<p>空腹時血糖が要注意です。健康管理に気をつけましょう。</p>';
} else {
    adviceElement_DM.innerHTML += '<p>空腹時血糖は正常です。健康を維持しましょう。</p>';
}

