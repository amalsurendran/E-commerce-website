const width_threshold = 480;


async function LineChartData() {
  let response = await fetch('/admin/dash-bord/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },

  });
  let res = await response.json();
  if (res) {
    let pieMonth = []
    let pieData = []
    let totalRevenueofMonth = []
    let totalRevenueofData = []
    res.pie.forEach(({
      _id,
      sum
    }) => {
      pieMonth.push(_id.status)
      pieData.push(sum)
    })

    res.revenue.forEach(({
      _id,
      sum
    }) => {
      totalRevenueofMonth.push(_id)
      totalRevenueofData.push(sum)
    })




    drawBarChart(totalRevenueofMonth, totalRevenueofData)
    drawPieChart(pieMonth, pieData)
    drawLineChart(res.chart.delivered, res.chart.cancelled, res.chart.returned)
  }
}


LineChartData()

function drawLineChart(delivered,cancelled,returned) {
  if ($("#lineChart").length) {
    ctxLine = document.getElementById("lineChart").getContext("2d");
    optionsLine = {
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Hits"
          }
        }]
      }
    };

    // Set aspect ratio based on window width
    optionsLine.maintainAspectRatio =
      $(window).width() < width_threshold ? false : true;

    configLine = {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July"
        ],
        datasets: [{
            label: "Delivered",
            data: delivered,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            cubicInterpolationMode: "monotone",
            pointRadius: 0
          },
          {
            label: "Cancelled",
            data: cancelled,
            fill: false,
            borderColor: "rgba(255,99,132,1)",
            cubicInterpolationMode: "monotone",
            pointRadius: 0
          },
          {
            label: "Returned",
            data: returned,
            fill: false,
            borderColor: "rgba(153, 102, 255, 1)",
            cubicInterpolationMode: "monotone",
            pointRadius: 0
          }
        ]
      },
      options: optionsLine
    };

    lineChart = new Chart(ctxLine, configLine);
  }
}

function drawBarChart(month, data) {
  if ($("#barChart").length) {
    ctxBar = document.getElementById("barChart").getContext("2d");

    optionsBar = {
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 0.2,
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: "Hits"
          }
        }]
      }
    };

    optionsBar.maintainAspectRatio =
      $(window).width() < width_threshold ? false : true;

    /**
     * COLOR CODES
     * Red: #F7604D
     * Aqua: #4ED6B8
     * Green: #A8D582
     * Yellow: #D7D768
     * Purple: #9D66CC
     * Orange: #DB9C3F
     * Blue: #3889FC
     */

    configBar = {
      type: "horizontalBar",
      data: {
        labels: month,
        datasets: [{
          label: "Revenue",
          data: data,
          backgroundColor: [
            "#F7604D",
            "#4ED6B8",
            "#A8D582",
            "#D7D768",
            "#9D66CC",
            "#DB9C3F",
            "#3889FC"
          ],
          borderWidth: 0
        }]
      },
      options: optionsBar
    };

    barChart = new Chart(ctxBar, configBar);
  }
}

function drawPieChart(month, data) {
  if ($("#pieChart").length) {
    var chartHeight = 300;

    $("#pieChartContainer").css("height", chartHeight + "px");

    ctxPie = document.getElementById("pieChart").getContext("2d");

    optionsPie = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      legend: {
        position: "top"
      }
    };

    configPie = {
      type: "pie",
      data: {
        datasets: [{
          data: data,
          backgroundColor: [ "#4ED6B8","#F7604D", "#A8D582"],
          label: "Storage"
        }],
        labels: month
      },
      options: optionsPie
    };

    pieChart = new Chart(ctxPie, configPie);
  }
}

function updateLineChart() {
  if (lineChart) {
    lineChart.options = optionsLine;
    lineChart.update();
  }
}

function updateBarChart() {
  if (barChart) {
    barChart.options = optionsBar;
    barChart.update();
  }
}