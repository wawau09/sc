// ----------------------------
// 1️⃣ 차트 초기화
// ----------------------------a
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

function test() {
    data_list.push(1.3);
    sleep(0.5);
    reload.update();
    data_list.push(2.7);
    sleep(0.5);
    reload.update();
    data_list.push(0.0);
    sleep(0.5);
    reload.update();
    data_list.push(5.7);
    sleep(0.5);
    reload.update();
    data_list.push(5.4);
    sleep(0.5);
    reload.update();
    data_list.push(2.9);
    sleep(0.5);
    reload.update();
}

// async function GetData() {
//     data_list.length = 0;

//     for (let i = 0; i < labels.length; i++) {
//         try {
//             const response = await fetch('/data');
//             const data = await response.json();

//             data_list.push(data['arduino_data']);

//             // datasets에 새 배열 재할당 후 업데이트
//             reload.data.datasets[0].data = [...data_list];
//             reload.update();

<<<<<<< HEAD
//         } catch (error) {
//             console.error("데이터 가져오기 실패:", error);
//         }

//         await sleep(500); // 0.5초 간격
//     }
// }
=======
        await sleep(500); // 0.5초 간격
    }
}

const rankList = document.getElementById('rankList');
const rankStatus = document.getElementById('rankStatus');
const rankUpdateBtn = document.getElementById('rankUpdateBtn');
const currentUser = document.body.dataset.user;
let lastAutoUpdate = 0;
let lastScoreSent = null;

function renderRankings(items) {
    rankList.innerHTML = '';
    if (!items.length) {
        rankList.innerHTML = '<li class="rank-item">기록이 아직 없어요</li>';
        return;
    }
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'rank-item';
        const name = item.display_name || `사용자 ${index + 1}`;
        li.innerHTML = `<span>${index + 1}. ${name}</span><span>${item.score.toFixed(1)}</span>`;
        rankList.appendChild(li);
    });
}

async function loadRankings() {
    try {
        const response = await fetch('/rankings');
        const data = await response.json();
        renderRankings(data.rankings || []);
    } catch (error) {
        console.error("랭킹 불러오기 실패:", error);
    }
}

function getScoreSnapshot() {
    if (!data_list.length) {
        return null;
    }
    const recent = data_list.slice(-5);
    const sum = recent.reduce((acc, value) => acc + value, 0);
    return sum / recent.length;
}

async function updateMyRanking(options = {}) {
    const silent = Boolean(options.silent);
    const score = getScoreSnapshot();
    if (score === null) {
        if (!silent) {
            rankStatus.textContent = '데이터가 쌓이면 기록을 업데이트할 수 있어요';
        }
        return;
    }
    try {
        const response = await fetch('/rankings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score })
        });
        if (!response.ok) {
            throw new Error('update failed');
        }
        if (!silent) {
            rankStatus.textContent = '기록 업데이트 완료!';
        }
        await loadRankings();
    } catch (error) {
        console.error("랭킹 업데이트 실패:", error);
        if (!silent) {
            rankStatus.textContent = '업데이트 실패. 다시 시도해줘요';
        }
    }
}

if (currentUser) {
    rankStatus.textContent = '최근 5개 평균값으로 내 기록을 업데이트합니다';
    rankUpdateBtn.disabled = false;
    rankUpdateBtn.addEventListener('click', () => updateMyRanking());
} else {
    rankUpdateBtn.disabled = true;
}

loadRankings();
setInterval(loadRankings, 10000);

function maybeAutoUpdate() {
    if (!currentUser) {
        return;
    }
    const score = getScoreSnapshot();
    if (score === null) {
        return;
    }
    const now = Date.now();
    if (now - lastAutoUpdate < 15000) {
        return;
    }
    if (lastScoreSent !== null && Math.abs(score - lastScoreSent) < 0.1) {
        return;
    }
    lastAutoUpdate = now;
    lastScoreSent = score;
    updateMyRanking({ silent: true });
}

setInterval(maybeAutoUpdate, 5000);
>>>>>>> 1d680c4 (변경)
