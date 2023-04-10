import '../App.css';
import { getQualisScore, updateTotalStats, linearRegression, getBoundedTrendPoint } from '../Utils/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ScoreGraphicView({init, end, stats, showStatistics}) {
  const dataCols = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'];

  const dataCounts = {
    Pontos: {
      background: '#415e98',
      border: 'white',
    },
    tot: {},
  };

  // reset total stats
  let totalStats = {};
  for (const key of Object.keys(dataCounts)) {
    totalStats[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
  }

  // reset year total counts
  let yearTotalCounts = {};
  for (const key of stats.year) {
    yearTotalCounts[key] = 0;
  }

  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      // reset year counts
      let yearCounts = {};
      for (const count of Object.keys(dataCounts)) {
        yearCounts[count] = 0;
      }

      for (const key of dataCols) {
        const countVal = getQualisScore(key, stats[key][currYear]);
        yearTotalCounts[stats.year[currYear]] += countVal;
        yearCounts.Pontos += countVal;
        yearCounts.tot += countVal;
      }

      totalStats = updateTotalStats(
        totalStats,
        yearCounts,
        stats.year[currYear]
      );
    }
  }

  // yearTotalCounts = Object.keys(yearTotalCounts).map(key => ({label: key, y: yearTotalCounts[key]}))
  const chartOptions = {
    legend: {
      display: true,
      label: 'Pontuação Qualis',
      labels: {
        padding: 20,
        generateLabels: function (chart) {
          const originalLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
          // Modify the label text
          for (var i = 0; i < originalLabels.length; i++) {
            originalLabels[i].text = 'Pontos acumulados';
          }
          return originalLabels;
        },
      },
    },
    yStepSize: 10,
  }
  const data = {
    labels: stats.year.map(year => year.toString()).reverse(),
    datasets: [
      {
        label: 'Pontos acumulados',
        data: yearTotalCounts,
        backgroundColor: '#415e98',
      }
    ]
  }
  
  const lineAnnotations = [];
  if (showStatistics && end - init > 0) {
    // create mean line annotation
    const mean = totalStats.tot.countList.mean().toFixed(2);    
    lineAnnotations.push({
      id: "mean",
      type: 'line',
      mode: 'horizontal',
      borderColor: '#2c4c8c',
      value: mean,
      scaleID: "y",
      borderWidth: 1,
      borderDash: [6, 6],
      label: {
        content: 'Média ' + mean.replace('.', ','),
        position: 'end',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    });
    
    // create median line annotation
    const median = totalStats.tot.countList.median().toFixed(2);
    lineAnnotations.push({
      id: "median",
      type: 'line',
      mode: 'horizontal',
      borderColor: '#2c4c8c',
      value: median,
      scaleID: "y",
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        content: 'Mediana ' + median.replace('.', ','),
        position: '50%',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    });

    // get max counts in totalStats
    const maxCount = totalStats.tot.countList.max();

    // create trend line annotation
    const regression = linearRegression(
      totalStats.tot.yearList,
      totalStats.tot.countList
    );
    const minPoint = getBoundedTrendPoint(
      regression,
      init,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    const maxPoint = getBoundedTrendPoint(
      regression,
      end,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    lineAnnotations.push({
      id: "trend",
      type: 'line',
      borderColor: '#2c4c8c',
      xMin: minPoint.x,
      xMax: maxPoint.x,
      xScaleID: 'x',
      yMin: minPoint.y.toFixed(2),
      yMax: maxPoint.y.toFixed(2),
      yScaleID: 'y',
      borderWidth: 1,
      borderDash: [2, 2],
      label: {
        content: 'Tendência ' + regression.slope.toFixed(2).replace('.', ','),
        position: 'end',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)', // 'rgba(0, 0, 0, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    })
  }

  const options = {
    plugins: {
      annotation: {
        annotations: lineAnnotations
      },
      legend: {
        labels: chartOptions.legend.labels,
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 1,
          maxRotation: 80,
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: chartOptions.yStepSize,
          font: {
            size: 11,
          },
          // remove separators from Y-axis ticks
          callback: function (value, index, ticks) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '');
          },
        },
        beginAtZero: true,
      },
    },
    borderWidth: 1,
    minBarThickness: 5,
    maxBarThickness: 12,
    responsive: true,
  };

  return (
    <>
      <h1>Pontuação Qualis</h1>
      <Bar options={options} data={data} />
    </>
  );
}

export default ScoreGraphicView;
