const ctx = document.getElementById('myChart').getContext('2d');

const data_list = [];

new Chart(ctx, {
    type: 'line',
    data: {
        labels: data_list,
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function GetData() {
    for(let i = 0; i < 6; i++) {  
        try {
            // const response = await fetch('/data');
            // const data = await response.json();
            data_list[i] = i;
            console.log(data_list);
        } catch (error) {
            console.log(error);
        }

        await sleep(500);
    }
}