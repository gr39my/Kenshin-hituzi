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

// 各CSVファイル名をリスト化
const csvFiles = [
    //'BMI.csv',
    //'腹囲.csv',

    '拡張期血圧.csv',
    '収縮期血圧.csv',
    
    '中性脂肪.csv',
    'LDL-C.csv',
    'HDL-C.csv',

    'HbA1C.csv',
    '空腹時血糖.csv'//,

    //'血清クレアチニン.csv',
    //'γ-GTP.csv',
    //'GPT(ALT).csv',
    //'GOT(AST).csv',
    //'eGFR.csv',
    //'尿糖.csv',
    //'尿蛋白.csv'
];

// CSVデータを取得し解析する関数
async function fetchAndParseCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    
    const rows = data.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    const result = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j]?.trim() || ''; // undefinedの場合は空文字
        }
        result.push(obj);
    }
    return result;
}

async function loadAndDisplayData() {
    for (const file of csvFiles) {
        const data = await fetchAndParseCSV(`open_data/data/${file}`);
        
        // フィルタリングの前に条件を確認
        console.log(`フィルタ条件: 都道府県=${prefecture}, 性別=${gender}, 年齢区分=${ageRange}`);

        const filteredData = data.filter(item => {
            return item['都道府県'] === prefecture && 
                   item['性別'] === gender && 
                   item['年齢区分'] === ageRange;
        });

        if (filteredData.length > 0) {
            createHistogram(filteredData, file.split('.')[0]); // 拡張子を除いたファイル名を使用
        }
    }
}

// データを読み込み、表示する
loadAndDisplayData();

// 検査値範囲から開始値を取得するヘルパー関数
function parseRangeStart(range) {
    // "150未満" -> 149
    const lessThanMatch = range.match(/(\d+(\.\d+)?)未満/);
    if (lessThanMatch) {
        return parseFloat(lessThanMatch[1]) - 0.1; // 比較のため、0.1を引く
    }
    
    // "150以上" -> 150
    const moreThanMatch = range.match(/(\d+(\.\d+)?)以上/);
    if (moreThanMatch) {
        return parseFloat(moreThanMatch[1]);
    }

    // "150-200" -> 150
    const rangeMatch = range.match(/(\d+(\.\d+)?)\-/);
    if (rangeMatch) {
        return parseFloat(rangeMatch[1]);
    }

    // デフォルトは0（数値が見つからなかった場合）
    return 0;
}

function createHistogram(data, fileName) {
    const ctx = document.getElementById(`${fileName}Histogram`).getContext('2d');

    // 検査値範囲を昇順にソートする
    const sortedData = data.sort((a, b) => {
        const aRangeStart = parseRangeStart(a['検査値範囲']);
        const bRangeStart = parseRangeStart(b['検査値範囲']);
        return aRangeStart - bRangeStart;
    });

    const labels = [];
    const values = [];

    // ソートされたデータをラベルと値に分ける
    sortedData.forEach(item => {
        labels.push(item['検査値範囲']);
        values.push(parseInt(item['人数']) || 0); // 人数が空の場合は0に設定
    });

    const chartData = {
        labels: labels,
        datasets: [{
            label: '人数',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}










const maxBloodPressure = parseInt(localStorage.getItem('maxBloodPressure')) || 0;
const minBloodPressure = parseInt(localStorage.getItem('minBloodPressure')) || 0;
const triglycerides = parseInt(localStorage.getItem('triglycerides')) || 0;
const hdl = parseInt(localStorage.getItem('hdl')) || 0;
const ldl = parseInt(localStorage.getItem('ldl')) || 0;
const hba1c = parseFloat(localStorage.getItem('hba1c')) || 0;
const fastingBloodSugar = parseInt(localStorage.getItem('fastingBloodSugar')) || 0;


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

