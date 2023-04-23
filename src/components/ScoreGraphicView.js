import '../App.css';
import {
  getQualisScore,
  updateTotalStats,
  getGraphicInfo,
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
  const datasets = [
    {
      label: 'Pontos acumulados',
      data: {},
      backgroundColor: '#415e98',
    }
  ]
  // reset year total counts
  for (const year of stats.year) {
    if (year >= init && year <= end) {
      datasets.data[year] = 0;
    }
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
        datasets.data[stats.year[currYear]] += countVal;
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

  const {data, options} = getGraphicInfo(datasets, stats.year, totalStats, showStatistics, end, init);

  return (
    <>
      <h1>Pontuação Qualis</h1>
      <Bar options={options} data={data} />
    </>
  );
}

export default ScoreGraphicView;
