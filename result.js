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
    if (age < 40) {
        return '40～44歳'; // 40歳未満は40～44歳のデータと比較
    } else if (age >= 75) {
        return '70～74歳'; // 75歳以上は70～74歳のデータと比較
    } else if (age >= 40 && age <= 44) {
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
    maxBloodPressure: { normal: 130, caution: 160, abnormal: 200 },
    minBloodPressure: { normal: 85, caution: 100, abnormal: 200 },
    
    hdl: { normal: 30, caution: 40, abnormal: 80 },
    ldl: { normal: 120, caution: 180, abnormal: 200 },
    triglycerides: { normal: 150, caution: 500, abnormal: 2000 },

    hba1c: { normal: 5.6, caution: 6.5, abnormal: 12.0 },
    fastingBloodSugar: { normal: 100, caution: 126, abnormal: 200 }
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

        // デバッグ用
        console.log('フィルタ後のデータ:', filteredData);

        if (filteredData.length > 0) {
            createHistogram(filteredData, file.split('.')[0]); // 拡張子を除いたファイル名を使用
        }
    }
}


// 検査値範囲から開始値を取得するヘルパー関数
function parseRangeStart(value) {
    return parseFloat(value) || 0; // 数値が見つからなかった場合、0を返す
}

// 検査値範囲から終了値を取得するヘルパー関数
function parseRangeEnd(value) {
    return value === 'inf' ? Infinity : parseFloat(value) || 0; // "inf"はInfinityとして扱う
}



// "あなた"と"▼"を表示するカスタムプラグイン
const arrowPlugin = {
    id: 'customArrow',
    afterDatasetsDraw(chart, args, options) {
        const { ctx, scales } = chart;
        const userValue = options.userValue;  // ユーザーの値を取得
        const x = scales.x;  // X軸
        const y = scales.y;  // Y軸

        // ユーザーの値に対応するX座標を計算
        let userPositionX = null;

        chart.data.labels.forEach((label, index) => {
            const [rangeStart, rangeEnd] = label.split(' - ').map(v => parseFloat(v));
            
            // rangeEnd が Infinity の場合に適切に処理する
            if (userValue >= rangeStart && (isNaN(rangeEnd) || userValue <= rangeEnd)) {
                userPositionX = x.getPixelForValue(index);  // X軸の位置を取得
            }
        });

        // ユーザー位置が見つかった場合にのみ描画
        if (userPositionX !== null) {
            const labelOffset = 15;  // "あなた"の表示位置調整
            const arrowHeight = 15;  // ▼ の高さ

            // "あなた" の描画
            ctx.font = '14px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText('あなた', userPositionX, y.top + labelOffset);

            // "▼" の描画 (上から下向き)
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('▼', userPositionX, y.top + arrowHeight + arrowHeight);
        }
    }
};



// ファイル名をstandardsのキーに変換する関数
function getStandardKey(fileName) {
    switch (fileName) {
        case '拡張期血圧': return 'minBloodPressure';
        case '収縮期血圧': return 'maxBloodPressure';
        case '中性脂肪': return 'triglycerides';
        case 'LDL-C': return 'ldl';
        case 'HDL-C': return 'hdl';
        case 'HbA1C': return 'hba1c';
        case '空腹時血糖': return 'fastingBloodSugar';
        default: return null; // 対応するキーがない場合はnullを返す
    }
}

function createHistogram(data, fileName) {
    const ctx = document.getElementById(`${fileName}Histogram`).getContext('2d');

    const standardKey = getStandardKey(fileName);
    if (!standardKey || !standards[standardKey]) {
        console.error(`基準値が見つかりません: ${fileName}`);
        return;
    }

    const sortedData = data.sort((a, b) => {
        const aLower = parseRangeStart(a['下限値']);
        const bLower = parseRangeStart(b['下限値']);
        return aLower - bLower;
    });

    const labels = [];
    const values = [];
    const backgroundColors = [];

    sortedData.forEach(item => {
        const rangeLabel = `${item['下限値']} - ${item['上限値'] === 'inf' ? '∞' : item['上限値']}`;
        labels.push(rangeLabel);
        values.push(parseInt(item['人数']) || 0);

        const lowerLimit = parseRangeStart(item['下限値']);
        const upperLimit = parseRangeEnd(item['上限値']);

        // HDL-Cの色付けロジックを修正
        if (fileName === 'HDL-C') {
            if (lowerLimit < standards[standardKey].normal) {
                backgroundColors.push('rgba(255, 99, 132, 0.5)'); // 異常: 赤色系
            } else if (lowerLimit < standards[standardKey].caution) {
                backgroundColors.push('rgba(255, 205, 86, 0.5)'); // 要注意: 黄色系
            } else {
                backgroundColors.push('rgba(75, 192, 192, 0.5)'); // 健康域: 青色系
            }
        } else {
            // HDL-C以外の色付けロジックはそのまま
            if (upperLimit <= standards[standardKey].normal) {
                backgroundColors.push('rgba(75, 192, 192, 0.5)'); // 健康域: 青色系
            } else if (upperLimit <= standards[standardKey].caution) {
                backgroundColors.push('rgba(255, 205, 86, 0.5)'); // 注意域: 黄色系
            } else {
                backgroundColors.push('rgba(255, 99, 132, 0.5)'); // 精密検査域: 赤色系
            }
        }
    });

    const chartData = {
        labels: labels,
        datasets: [{
            label: '人数',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(75, 75, 75, 1)',
            borderWidth: 1
        }]
    };

    const userValue = getUserValue(fileName); // ユーザーの値を取得
    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            customArrow: {
                userValue: userValue  // ユーザーの値を渡す
            }
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions,
        plugins: [arrowPlugin]  // カスタムプラグインを追加
    });
}


// ユーザーの値を取得する関数
function getUserValue(fileName) {
    switch (fileName) {
        case '拡張期血圧':
            return minBloodPressure;  // 例: 最小血圧
        case '収縮期血圧':
            return maxBloodPressure;  // 例: 最大血圧
        case '中性脂肪':
            return triglycerides;     // 例: 中性脂肪
        case 'LDL-C':
            return ldl;               // 例: LDLコレステロール
        case 'HDL-C':
            return hdl;               // 例: HDLコレステロール
        case 'HbA1C':
            return hba1c;             // 例: HbA1c
        case '空腹時血糖':
            return fastingBloodSugar;  // 例: 空腹時血糖
        default:
            return null;              // デフォルトはnull
    }
}






// データを読み込み、表示する
loadAndDisplayData();












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

// 血圧の状態を評価する関数
function evaluateBloodPressure() {
    let systolicStatus = '';  // 収縮期血圧の状態
    let diastolicStatus = ''; // 拡張期血圧の状態

    // 収縮期血圧（最大血圧）の評価
    if (maxBloodPressure > standards.maxBloodPressure.caution) {
        systolicStatus = 'abnormal';
    } else if (maxBloodPressure > standards.maxBloodPressure.normal) {
        systolicStatus = 'caution';
    } else {
        systolicStatus = 'normal';
    }

    // 拡張期血圧（最小血圧）の評価
    if (minBloodPressure > standards.minBloodPressure.caution) {
        diastolicStatus = 'abnormal';
    } else if (minBloodPressure > standards.minBloodPressure.normal) {
        diastolicStatus = 'caution';
    } else {
        diastolicStatus = 'normal';
    }

    return { systolicStatus, diastolicStatus };
}

// アドバイスを表示する関数
function displayBloodPressureAdvice() {
    const { systolicStatus, diastolicStatus } = evaluateBloodPressure();
    let advice = '';

    // 9パターンのコメントを設定
    if (systolicStatus === 'normal' && diastolicStatus === 'normal') {
        advice = '高血圧の心配はないメェ。健康だメェ';
    } else if (systolicStatus === 'caution' && diastolicStatus === 'normal') {
        advice = '同年代と比べても、収縮期血圧が高めだメェ。<br>収縮期血圧を下げるには、塩分の摂取を控えたり、運動が効果的だメェ';
    } else if (systolicStatus === 'normal' && diastolicStatus === 'caution') {
        advice = '同年代と比べても、拡張期血圧が高めだメェ。拡張期血圧を下げるには、ストレス管理や睡眠が大事だメェ';
    } else if (systolicStatus === 'abnormal' && diastolicStatus === 'normal') {
        advice = '収縮期血圧は精密検査をした方がいいレベルだメェ。お医者さんにかかるのは当然として、塩分の摂取を減らしたり、有酸素運動が効果的だメェ';
    } else if (systolicStatus === 'normal' && diastolicStatus === 'abnormal') {
        advice = '拡張期血圧は精密検査をした方がいいレベルだメェ。お医者さんにかかるのは当然として、ストレスを減らすことが効果的だメェ';
    } else if (systolicStatus === 'caution' && diastolicStatus === 'caution') {
        advice = '収縮期血圧と拡張期血圧がともに高めだメェ。塩分を減らしたり、ストレスを管理して、健康を守ろうメェ';
    } else if (systolicStatus === 'abnormal' && diastolicStatus === 'caution') {
        advice = '収縮期血圧は危険域、拡張期血圧も注意域だメェ。すぐに医師に相談して、生活習慣の改善が必要だメェ';
    } else if (systolicStatus === 'caution' && diastolicStatus === 'abnormal') {
        advice = '拡張期血圧は精密検査が必要だメェ。収縮期血圧も要注意なので、早めの対応を心がけるメェ';
    } else if (systolicStatus === 'abnormal' && diastolicStatus === 'abnormal') {
        advice = '収縮期血圧も拡張期血圧も危険域だメェ。直ちに医師の診断を受けて、生活習慣を見直すメェ';
    }

    // アドバイスを表示
    adviceElement_HBP.innerHTML = `<p>${advice}</p>`;
}

// アドバイスを表示
displayBloodPressureAdvice();




function evaluateLipidLevels() {
    let hdlStatus = '';   // HDL-Cの状態
    let ldlStatus = '';   // LDL-Cの状態
    let tgStatus = '';    // 中性脂肪の状態

    // HDL-Cの評価
    if (hdl < standards.hdl.caution) {
        hdlStatus = 'abnormal';
    } else if (hdl < standards.hdl.normal) {
        hdlStatus = 'caution';
    } else {
        hdlStatus = 'normal';
    }

    // LDL-Cの評価
    if (ldl > standards.ldl.caution) {
        ldlStatus = 'abnormal';
    } else if (ldl > standards.ldl.normal) {
        ldlStatus = 'caution';
    } else {
        ldlStatus = 'normal';
    }

    // 中性脂肪（トリグリセリド）の評価
    if (triglycerides > standards.triglycerides.caution) {
        tgStatus = 'abnormal';
    } else if (triglycerides > standards.triglycerides.normal) {
        tgStatus = 'caution';
    } else {
        tgStatus = 'normal';
    }

    return { hdlStatus, ldlStatus, tgStatus };
}

function displayLipidAdvice() {
    let { hdlStatus, ldlStatus, tgStatus } = evaluateLipidLevels();
    let advice = '';

    // すべてが正常
    if (hdlStatus === 'normal' && ldlStatus === 'normal' && tgStatus === 'normal') {
        advice = '脂質の問題はないメェ。引き続き健康を維持しましょうメェ！';
    }
    // HDL-Cが要注意
    else if (hdlStatus === 'caution' && ldlStatus === 'normal' && tgStatus === 'normal') {
        advice = 'HDL-Cがやや低めだメェ。運動を増やして、健康を維持しましょうメェ！';
    }
    // LDL-Cが要注意
    else if (hdlStatus === 'normal' && ldlStatus === 'caution' && tgStatus === 'normal') {
        advice = 'LDL-Cが少し高めだメェ。食事に気をつけてくださいメェ！';
    }
    // 中性脂肪が要注意
    else if (hdlStatus === 'normal' && ldlStatus === 'normal' && tgStatus === 'caution') {
        advice = '中性脂肪がやや高めだメェ。食生活に気をつけましょうメェ！';
    }
    // HDL-Cが異常
    else if (hdlStatus === 'abnormal' && ldlStatus === 'normal' && tgStatus === 'normal') {
        advice = 'HDL-Cが低すぎるメェ。医師に相談してくださいメェ！';
    }
    // LDL-Cが異常
    else if (hdlStatus === 'normal' && ldlStatus === 'abnormal' && tgStatus === 'normal') {
        advice = 'LDL-Cが高いメェ。医師に相談して、食事を見直しましょうメェ！';
    }
    // 中性脂肪が異常
    else if (hdlStatus === 'normal' && ldlStatus === 'normal' && tgStatus === 'abnormal') {
        advice = '中性脂肪が高すぎるメェ。医師に相談してくださいメェ！';
    }

    // HDL-C要注意 + LDL-C要注意
    else if (hdlStatus === 'caution' && ldlStatus === 'caution' && tgStatus === 'normal') {
        advice = 'HDL-CとLDL-Cがどちらも要注意だメェ。運動や食事に注意しましょうメェ！';
    }
    // HDL-C要注意 + 中性脂肪要注意
    else if (hdlStatus === 'caution' && ldlStatus === 'normal' && tgStatus === 'caution') {
        advice = 'HDL-Cと中性脂肪がどちらも要注意だメェ。運動と食生活を見直しましょうメェ！';
    }
    // LDL-C要注意 + 中性脂肪要注意
    else if (hdlStatus === 'normal' && ldlStatus === 'caution' && tgStatus === 'caution') {
        advice = 'LDL-Cと中性脂肪がどちらも高めだメェ。生活習慣の改善を考えましょうメェ！';
    }
    // HDL-C異常 + LDL-C異常
    else if (hdlStatus === 'abnormal' && ldlStatus === 'abnormal' && tgStatus === 'normal') {
        advice = 'HDL-CとLDL-Cが異常だメェ。すぐに医師に相談してくださいメェ！';
    }
    // HDL-C異常 + 中性脂肪異常
    else if (hdlStatus === 'abnormal' && ldlStatus === 'normal' && tgStatus === 'abnormal') {
        advice = 'HDL-Cと中性脂肪が異常だメェ。医師に相談し、改善策を考えましょうメェ！';
    }
    // LDL-C異常 + 中性脂肪異常
    else if (hdlStatus === 'normal' && ldlStatus === 'abnormal' && tgStatus === 'abnormal') {
        advice = 'LDL-Cと中性脂肪が異常だメェ。医師に相談し、生活改善が必要だメェ！';
    }

    // HDL-C要注意 + LDL-C異常
    else if (hdlStatus === 'caution' && ldlStatus === 'abnormal' && tgStatus === 'normal') {
        advice = 'HDL-Cがやや低めで、LDL-Cが異常だメェ。運動を増やして、医師に相談しましょうメェ！';
    }
    // HDL-C要注意 + 中性脂肪異常
    else if (hdlStatus === 'caution' && ldlStatus === 'normal' && tgStatus === 'abnormal') {
        advice = 'HDL-Cがやや低めで、中性脂肪が異常だメェ。運動を増やして、医師に相談しましょうメェ！';
    }
    // LDL-C要注意 + 中性脂肪異常
    else if (hdlStatus === 'normal' && ldlStatus === 'caution' && tgStatus === 'abnormal') {
        advice = 'LDL-Cがやや高めで、中性脂肪が異常だメェ。食事の改善と医師に相談が必要だメェ！';
    }

    // HDL-C異常 + LDL-C要注意
    else if (hdlStatus === 'abnormal' && ldlStatus === 'caution' && tgStatus === 'normal') {
        advice = 'HDL-Cが異常で、LDL-Cがやや高めだメェ。医師に相談して、食生活を見直しましょうメェ！';
    }
    // HDL-C異常 + 中性脂肪要注意
    else if (hdlStatus === 'abnormal' && ldlStatus === 'normal' && tgStatus === 'caution') {
        advice = 'HDL-Cが異常で、中性脂肪がやや高めだメェ。医師に相談し、生活習慣を見直しましょうメェ！';
    }
    // LDL-C異常 + 中性脂肪要注意
    else if (hdlStatus === 'normal' && ldlStatus === 'abnormal' && tgStatus === 'caution') {
        advice = 'LDL-Cが異常で、中性脂肪がやや高めだメェ。医師に相談し、食事の改善をしましょうメェ！';
    }

    // HDL-C要注意 + LDL-C要注意 + 中性脂肪異常
    else if (hdlStatus === 'caution' && ldlStatus === 'caution' && tgStatus === 'abnormal') {
        advice = 'HDL-CとLDL-Cが要注意で、中性脂肪が異常だメェ。生活習慣を改善して、医師に相談しましょうメェ！';
    }
    // HDL-C異常 + LDL-C要注意 + 中性脂肪要注意
    else if (hdlStatus === 'abnormal' && ldlStatus === 'caution' && tgStatus === 'caution') {
        advice = 'HDL-Cが異常で、LDL-Cと中性脂肪がやや高めだメェ。医師に相談して、生活習慣を見直しましょうメェ！';
    }
    // HDL-C要注意 + LDL-C異常 + 中性脂肪要注意
    else if (hdlStatus === 'caution' && ldlStatus === 'abnormal' && tgStatus === 'caution') {
        advice = 'HDL-Cがやや低めで、LDL-Cが異常、中性脂肪がやや高めだメェ。医師に相談して、運動と食事の改善が必要だメェ！';
    }

    // すべてが異常
    else if (hdlStatus === 'abnormal' && ldlStatus === 'abnormal' && tgStatus === 'abnormal') {
        advice = 'HDL-C、LDL-C、中性脂肪のすべてが異常だメェ。すぐに医師に相談してくださいメェ！';
    }

    // アドバイスを表示
    adviceElement_HL.innerHTML = '<p>' + advice + '</p>';
}

displayLipidAdvice();




function evaluateDiabetesLevels() {
    let hba1cStatus = '';   // HbA1cの状態
    let fastingBloodSugarStatus = '';   // 空腹時血糖の状態

    // HbA1cの評価
    if (hba1c > standards.hba1c.abnormal) {
        hba1cStatus = 'abnormal';
    } else if (hba1c > standards.hba1c.caution) {
        hba1cStatus = 'caution';
    } else {
        hba1cStatus = 'normal';
    }

    // 空腹時血糖の評価
    if (fastingBloodSugar > standards.fastingBloodSugar.abnormal) {
        fastingBloodSugarStatus = 'abnormal';
    } else if (fastingBloodSugar > standards.fastingBloodSugar.caution) {
        fastingBloodSugarStatus = 'caution';
    } else {
        fastingBloodSugarStatus = 'normal';
    }

    return { hba1cStatus, fastingBloodSugarStatus };
}



function displayDiabetesAdvice() {
    let hba1cStatus = '';  // HbA1cの状態
    let fastingBloodSugarStatus = '';  // 空腹時血糖の状態

    // HbA1cの評価
    if (hba1c > standards.hba1c.abnormal) {
        hba1cStatus = 'abnormal';
    } else if (hba1c > standards.hba1c.caution) {
        hba1cStatus = 'caution';
    } else {
        hba1cStatus = 'normal';
    }

    // 空腹時血糖の評価
    if (fastingBloodSugar > standards.fastingBloodSugar.abnormal) {
        fastingBloodSugarStatus = 'abnormal';
    } else if (fastingBloodSugar > standards.fastingBloodSugar.caution) {
        fastingBloodSugarStatus = 'caution';
    } else {
        fastingBloodSugarStatus = 'normal';
    }

    let advice = '';

    // すべてが正常
    if (hba1cStatus === 'normal' && fastingBloodSugarStatus === 'normal') {
        advice = '糖尿病の心配はないメェ。引き続き健康を維持しましょうメェ！';
    }
    // HbA1cが要注意で、空腹時血糖が正常
    else if (hba1cStatus === 'caution' && fastingBloodSugarStatus === 'normal') {
        advice = 'HbA1cがやや高めだメェ。生活習慣に気をつけて、血糖値を安定させましょうメェ！';
    }
    // 空腹時血糖が要注意で、HbA1cが正常
    else if (hba1cStatus === 'normal' && fastingBloodSugarStatus === 'caution') {
        advice = '空腹時血糖がやや高めだメェ。食生活に気をつけましょうメェ！';
    }
    // HbA1cが異常で、空腹時血糖が正常
    else if (hba1cStatus === 'abnormal' && fastingBloodSugarStatus === 'normal') {
        advice = 'HbA1cが高いメェ。医師に相談してくださいメェ！';
    }
    // 空腹時血糖が異常で、HbA1cが正常
    else if (hba1cStatus === 'normal' && fastingBloodSugarStatus === 'abnormal') {
        advice = '空腹時血糖が高いメェ。医師に相談してくださいメェ！';
    }
    // HbA1cが要注意で、空腹時血糖も要注意
    else if (hba1cStatus === 'caution' && fastingBloodSugarStatus === 'caution') {
        advice = 'HbA1cと空腹時血糖がどちらも要注意だメェ。生活習慣を改善しましょうメェ！';
    }
    // HbA1cが異常で、空腹時血糖が要注意
    else if (hba1cStatus === 'abnormal' && fastingBloodSugarStatus === 'caution') {
        advice = 'HbA1cが異常で、空腹時血糖もやや高めだメェ。医師に相談して、改善策を見つけましょうメェ！';
    }
    // 空腹時血糖が異常で、HbA1cが要注意
    else if (hba1cStatus === 'caution' && fastingBloodSugarStatus === 'abnormal') {
        advice = '空腹時血糖が異常で、HbA1cもやや高めだメェ。医師に相談して、改善策を考えましょうメェ！';
    }
    // どちらも異常
    else if (hba1cStatus === 'abnormal' && fastingBloodSugarStatus === 'abnormal') {
        advice = 'HbA1cと空腹時血糖のどちらも異常だメェ。すぐに医師に相談してくださいメェ！';
    }

    // アドバイスを表示
    adviceElement_DM.innerHTML = '<p>' + advice + '</p>';
}


displayDiabetesAdvice();