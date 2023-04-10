import '../App.css';
import { getQualisScore } from '../Utils/utils';
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

  // reset year total counts
  let yearTotalCounts = {};
  for (const key of stats.year) {
    yearTotalCounts[key] = 0;
  }

  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      for (const key of dataCols) {
        yearTotalCounts[stats.year[currYear]] += getQualisScore(key, stats[key][currYear]);
      }
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

  const options = {
    plugins: {
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
