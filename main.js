// グラフを描画する関数
function drawChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    // 棒グラフのデータ
    const data = {
        labels: ['100万円', '600万円', '1,000万円', '1,500万円', '2,000万円', '3,000万円', '5,000万円', '1億円'],
        datasets: [{
            label: '金融資産の保有額',
            data: [300, 400, 100, 50, 20, 15, 5, 1],  // サンプルデータ
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    // グラフの設定
    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    // Chart.jsでグラフを描画
    new Chart(ctx, config);
}

// ページ読み込み時にグラフを描画
window.onload = drawChart;
