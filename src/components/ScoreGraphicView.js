import '../App.css';
import {
  getQualisScore,
  updateTotalStats,
  getStatisticsAnnotations,
  qualisScores
} from '../Utils/utils';
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
  const dataCols = Object.keys(qualisScores);
  const dataCounts = {
    Pontos: {
      background: '#415e98',
      border: 'white',
    },
    tot: {},
  };

  // reset year total counts
  let yearTotalCounts = {};
  for (const key of stats.year) {
    yearTotalCounts[key] = 0;
  }
  // reset total stats
  let totalStats = {};
  for (const key of Object.keys(dataCounts)) {
    totalStats[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
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

  const lineAnnotations = getStatisticsAnnotations(totalStats, showStatistics, end, init);
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
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
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
