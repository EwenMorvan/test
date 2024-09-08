document.addEventListener("DOMContentLoaded", function() {
    const septentrioOrange = "#ff9211";
    const white = "#ffffff";
    // Sélectionne tous les éléments avec la classe 'sidebar-icon'
    const mainMenuButtons = document.querySelectorAll('.sidebar-icon');

    const title = document.getElementById("title");

    const dashboardDiv = document.getElementById("dashboard_div");
    const adjustmentsDiv = document.getElementById("adjustments_div");
    const headingDiv = document.getElementById("heading_div");
    const worldDiv = document.getElementById("world_div");
    const settingsDiv = document.getElementById("settings_div");

    const selectorLineDashboard = document.getElementById("selector-line-dashboard");
    const selectorLineAdjustments = document.getElementById("selector-line-adjustements");
    const selectorLineHeading = document.getElementById("selector-line-heading");
    const selectorLineWorld = document.getElementById("selector-line-world");
    const selectorLineSettings = document.getElementById("selector-line-settings");

    const btnDashboard = document.getElementById("dashboard_icon");
    const btnAdjustments = document.getElementById("adjustments_icon");
    const btnHeading = document.getElementById("heading_icon");
    const btnWorld = document.getElementById("world_icon");
    const btnSettings = document.getElementById("settings_icon");



    // Ajoute un écouteur d'événements à chaque bouton
    mainMenuButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Button clicked:', this.id);
            changeMenu(this.id);
            
            
        });
    });

    function changeMenu(id){

        switch(id){
            case ("dashboard_icon"):
                title.textContent = "General Overview";
                dashboardDiv.style.display = "block";
                adjustmentsDiv.style.display = "none";
                headingDiv.style.display = "none";
                worldDiv.style.display = "none";
                settingsDiv.style.display = "none";
                selectorLineDashboard.style.display = "block";
                selectorLineAdjustments.style.display = "none";
                selectorLineHeading.style.display = "none";
                selectorLineWorld.style.display = "none";
                selectorLineSettings.style.display = "none";
                btnDashboard.style.fill = septentrioOrange;
                btnAdjustments.style.fill = white;
                btnHeading.style.fill = white;
                btnWorld.style.fill = white;
                btnSettings.style.fill = white;


                break;
            case ("adjustments_icon"):
                title.textContent = "Dualy Settings";
                dashboardDiv.style.display = "none";
                adjustmentsDiv.style.display = "block";
                headingDiv.style.display = "none";
                worldDiv.style.display = "none";
                settingsDiv.style.display = "none";
                selectorLineDashboard.style.display = "none";
                selectorLineAdjustments.style.display = "block";
                selectorLineHeading.style.display = "none";
                selectorLineWorld.style.display = "none";
                selectorLineSettings.style.display = "none";
                btnDashboard.style.fill = white;
                btnAdjustments.style.fill = septentrioOrange;
                btnHeading.style.fill = white;
                btnWorld.style.fill = white;
                btnSettings.style.fill = white;

                break;
            case ("heading_icon"):
                title.textContent = "General Attitude";
                dashboardDiv.style.display = "none";
                adjustmentsDiv.style.display = "none";
                headingDiv.style.display = "block";
                worldDiv.style.display = "none";
                settingsDiv.style.display = "none";
                selectorLineDashboard.style.display = "none";
                selectorLineAdjustments.style.display = "none";
                selectorLineHeading.style.display = "block";
                selectorLineWorld.style.display = "none";
                selectorLineSettings.style.display = "none";
                btnDashboard.style.fill = white;
                btnAdjustments.style.fill = white;
                btnHeading.style.fill = septentrioOrange;
                btnWorld.style.fill = white;
                btnSettings.style.fill = white;

                break;
            case ("world_icon"):
                title.textContent = "Maps View";
                dashboardDiv.style.display = "none";
                adjustmentsDiv.style.display = "none";
                headingDiv.style.display = "none";
                worldDiv.style.display = "block";
                settingsDiv.style.display = "none";
                selectorLineDashboard.style.display = "none";
                selectorLineAdjustments.style.display = "none";
                selectorLineHeading.style.display = "none";
                selectorLineWorld.style.display = "block";
                selectorLineSettings.style.display = "none";
                btnDashboard.style.fill = white;
                btnAdjustments.style.fill = white;
                btnHeading.style.fill = white;
                btnWorld.style.fill = septentrioOrange;
                btnSettings.style.fill = white;
                loadMap();
                break;
            case ("settings_icon"):
                title.textContent = "Mosaic Settings";
                dashboardDiv.style.display = "none";
                adjustmentsDiv.style.display = "none";
                headingDiv.style.display = "none";
                worldDiv.style.display = "none";
                settingsDiv.style.display = "block";
                selectorLineDashboard.style.display = "none";
                selectorLineAdjustments.style.display = "none";
                selectorLineHeading.style.display = "none";
                selectorLineWorld.style.display = "none";
                selectorLineSettings.style.display = "block";
                btnDashboard.style.fill = white;
                btnAdjustments.style.fill = white;
                btnHeading.style.fill = white;
                btnWorld.style.fill = white;
                btnSettings.style.fill = septentrioOrange;

                break;
            default:
                console.log("ERROR: id not know...");
                break;

        }
    }

    // This display or not a mask over the containerMenu1 to let the user undersand that he need to scroll up or down
    const containerMenu1 = document.querySelector('.containerMenu1');
    function updateMask() {
        const scrollTop = containerMenu1.scrollTop;
        const scrollHeight = containerMenu1.scrollHeight;
        const clientHeight = containerMenu1.clientHeight;

        if (scrollTop === 0 && scrollHeight <= clientHeight) {
            containerMenu1.classList.add('no-mask');
            containerMenu1.classList.remove('no-mask-top', 'no-mask-bottom');
        } else if (scrollTop === 0) {
            containerMenu1.classList.add('no-mask-top');
            containerMenu1.classList.remove('no-mask', 'no-mask-bottom');
        } else if (scrollTop + clientHeight >= scrollHeight) {
            containerMenu1.classList.add('no-mask-bottom');
            containerMenu1.classList.remove('no-mask', 'no-mask-top');
        } else {
            containerMenu1.classList.remove('no-mask', 'no-mask-top', 'no-mask-bottom');
        }
    }
    containerMenu1.addEventListener('scroll', updateMask);
    window.addEventListener('resize', updateMask);
    updateMask();

    // This function is used to change the gauges values with specific id
    function setGaugeValue(id, value) {
        const gauge = document.getElementById(id);
        const circle = gauge.querySelector('.circle');
        const text = gauge.querySelector('.percentage');
        const radius = 15.9155;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / 100 * circumference);
        
        circle.style.strokeDasharray = `${value}, 100`;
        text.textContent = `${value}%`;
    }

    // Example of how to change the value of the gauge
    setGaugeValue('gaugeCPU', 5);

    // Generate labels and data arrays with 100 points
    var labels = [];
    var data = [];
    for (var i = 0; i < 30; i++) {
        labels.push(i.toString());
        data.push(0);
    }
    var ctx = document.getElementById('CPUchart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                borderColor: 'rgba(0, 221, 0, 0.5)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0 // This hides the points
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 0 // Disable animation to improve performance
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    display: false // This hides the X axis
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            }
        }
    });

    function updateChart(chart, newValue) {
        chart.data.labels.push((parseInt(chart.data.labels[chart.data.labels.length - 1]) + 1).toString()); // Add new label
        chart.data.labels.shift(); // Remove the first label
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(newValue); // Add new data point
            dataset.data.shift(); // Remove the first data point
        });
        chart.update('none'); // Update the chart without animation
    }

    // Example usage
    setInterval(() => {
        var newRandomValue = Math.floor(Math.random() * 101); // Generate a random value between 0 and 100
        updateChart(myChart, newRandomValue);
    setGaugeValue('gaugeCPU', newRandomValue);

    }, 500); // Update the chart every 0.1 seconds
});
