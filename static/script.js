// ----------------------------
// 1️⃣ 차트 초기화
// ----------------------------
const ctx = document.getElementById('myChart').getContext('2d');
const data_list = [];
const labels = ['0.5s', '1.0s', '1.5s', '2.0s', '2.5s', '3.0s'];

const reload = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Revenue',
                data: data_list,
                borderColor: '#00B0FF',
                backgroundColor: 'rgba(0, 180, 255, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'start',
                labels: {
                    color: 'white',
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value}K`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: 'black' },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: { color: 'black' },
                grid: {
                    color: 'rgba(107, 114, 128, 0.3)',
                    drawBorder: false
                }
            }
        }
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function GetData() {
    data_list.length = 0;

    for (let i = 0; i < labels.length; i++) {
        try {
            const response = await fetch('/data');
            const data = await response.json();

            data_list.push(data['arduino_data']);

            // datasets에 새 배열 재할당 후 업데이트
            reload.data.datasets[0].data = [...data_list];
            reload.update();

        } catch (error) {
            console.error("데이터 가져오기 실패:", error);
        }

        await sleep(500); // 0.5초 간격
    }
}