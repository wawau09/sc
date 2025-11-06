const ctx = document.getElementById('myChart').getContext('2d');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['01 Mar', '02 Mar', '03 Mar', '04 Mar', '05 Mar', '06 Mar', '07 Mar'],
        datasets: [
            {
                label: 'Revenue',
                data: [4500, 6000, 4500, 5000, 4800, 6500, 7500],
                borderColor: '#00B0FF',
                backgroundColor: 'rgba(0, 180, 255, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Net Income',
                data: [1000, 3000, 2000, 2500, 3500, 4000, 4800],
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