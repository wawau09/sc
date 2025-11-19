document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('myChart').getContext('2d');
    const reload = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0.5s','1.0s','1.5s','2.0s','2.5s','3.0s'],
            datasets: [{
                label: 'Current',
                data: [],
                borderColor: '#00B0FF',
                backgroundColor: 'rgba(0,180,255,0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: { responsive:true }
    });

    async function GetData() {
        const temp = [];
        for(let i=0;i<6;i++){
            try{
                const response = await fetch('/data');
                const data = await response.json();
                temp.push(Number(data.arduino_data)); // 숫자로 변환
                reload.data.datasets[0].data = [...temp];
                reload.update();
            } catch(e){
                console.log(e);
            }
            await new Promise(r=>setTimeout(r,500));
        }
    }

    await GetData();
});