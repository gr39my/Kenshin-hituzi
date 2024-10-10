// ユーザーの入力を取得
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

