const ctx = document.getElementById('myChart').getContext('2d');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['0.5', '1', '1.5', '2', '2.5', '3'],
        datasets: [
            {
                label: 'Revenue',
                data: [4500, 6000, 4500, 5000, 4800, 6500],
                borderColor: '#00B0FF',
                backgroundColor: 'rgba(0, 180, 255, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Net Income',
                data: [1000, 3000, 2000, 2500, 3500, 4000],
                borderColor: '#00FF96',
                backgroundColor: 'rgba(0, 255, 160, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
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
                    usePointStyle: true,
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
                        return `${label}: ${value / 1000}K`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: 'white' },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                
                grid: {
                    color: 'rgba(107, 114, 128, 0.3)',
                    drawBorder: false
                },
            }
        }
    }
});

async function updateData() {
    try {
    const response = await fetch('/data');
    const data = await response.json();
    document.getElementById('value').innerText = data.arduino_data + " mA";
    } catch (error) {
    document.getElementById('value').innerText = "데이터를 불러오지 못했습니다.";
    }

    // 1초마다 업데이트
    setInterval(updateData, 1000);
    updateData(); // 즉시 1회 실행
}