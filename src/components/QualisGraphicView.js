import '../App.css';
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

function QualisGraphicView({init, end, stats, showStatistics}) {
  const dataCols = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'];

  let yearTotalCounts = {
    "A" : {},
    "B" : {},
    "C" : {},
    "N" : {}
  }

  for (const year of stats.year) {
    for (const count of Object.keys(yearTotalCounts)) {
      yearTotalCounts[count][year] = 0;
    }
  }

  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      for (const key of dataCols) {
        const keyChar = key.slice(0, 1);
        yearTotalCounts[keyChar][stats.year[currYear]] += stats[key][currYear];
      }
    }
  }

  const options = {
    plugins: {
      title: {
        display: false,
      },
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
  const labels = stats.year.map(year => year.toString()).reverse();
  const data = {
    labels,
    datasets: [
      {
        label: 'A',
        data: yearTotalCounts.A,
        backgroundColor: '#415e98',
      },
      {
        label: 'B',
        data: yearTotalCounts.B,
        backgroundColor: '#657cab',
      },
      {
        label: 'C',
        data: yearTotalCounts.C,
        backgroundColor: '#9dabc9',
      },
      {
        label: 'N',
        data: yearTotalCounts.N,
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
