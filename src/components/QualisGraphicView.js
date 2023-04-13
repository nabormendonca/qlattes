import '../App.css';
import {
  qualisScores,
  updateTotalStats,
  getStatisticsAnnotations
} from '../Utils/utils';
import annotationPlugin from 'chartjs-plugin-annotation';
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
ChartJS.register(annotationPlugin);

function QualisGraphicView({init, end, stats, showStatistics}) {
  const dataCols = Object.keys(qualisScores);
  let dataCounts = {
    "A" : {},
    "B" : {},
    "C" : {},
    "N" : {},
    tot: {},
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
  for (const year of stats.year) {
    for (const count of Object.keys(dataCounts)) {
      dataCounts[count][year] = 0;
    }
  }

  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      // reset year counts
      let yearCounts = {};
      for (const count of Object.keys(dataCounts)) {
        yearCounts[count] = 0;
      }

      for (const key of dataCols) {
        const keyChar = key.slice(0, 1);
        dataCounts[keyChar][stats.year[currYear]] += stats[key][currYear];
        yearCounts[keyChar] += stats[key][currYear];
        yearCounts.tot += stats[key][currYear];
      }

      totalStats = updateTotalStats(
        totalStats,
        yearCounts,
        stats.year[currYear]
      );
    }
  }
  
  const lineAnnotations = getStatisticsAnnotations(totalStats, showStatistics, end, init);
  const options = {
    plugins: {
      annotation: {
        annotations: lineAnnotations
      }
    },
    responsive: true,
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
  };
  const data = {
    labels: stats.year.map(year => year.toString()).reverse(),
    datasets: [
      {
        label: 'A',
        data: dataCounts.A,
        backgroundColor: '#415e98',
      },
      {
        label: 'B',
        data: dataCounts.B,
        backgroundColor: '#657cab',
      },
      {
        label: 'C',
        data: dataCounts.C,
        backgroundColor: '#9dabc9',
      },
      {
        label: 'N',
        data: dataCounts.N,
        backgroundColor: '#c3cbde',
      },
    ],
  };

  return (
    <>
      <h1>Estrato Qualis</h1>
      <Bar options={options} data={data} />
    </>
  );
}

export default QualisGraphicView;
