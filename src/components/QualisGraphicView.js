import '../App.css';
import { updateTotalStats, linearRegression, getBoundedTrendPoint } from '../Utils/utils';
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
  const dataCols = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'];

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
  const labels = stats.year.map(year => year.toString()).reverse();
  const data = {
    labels,
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
