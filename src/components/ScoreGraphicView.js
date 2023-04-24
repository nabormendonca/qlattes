import '../App.css';
import {
  updateTotalStats,
  getGraphicInfo,
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

function ScoreGraphicView({init, end, stats, showStatistics, areaData}) {
  if (!areaData || Object.keys(areaData).length === 0) {
    alert(`Para visualizar a pontuação Qualis, é necessário selecionar uma Área do Conhecimento.`);
    return;
  }
  const qualisScores = areaData.scores;
  const dataCols = Object.keys(qualisScores);
  const dataCounts = {
    A: {},
    B: {},
    tot: {},
  };
  // reset year total counts
  for (const key of Object.keys(dataCounts)) {
    for (const year of stats.year) {
      if (year >= init && year <= end) {
        dataCounts[key][year] = 0;
      }
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
        const countVal = qualisScores[key] * stats[key][currYear];

        if (key.includes('A')) {
          yearCounts.A += countVal;
          dataCounts.A[stats.year[currYear]] += countVal;
        } else {
          yearCounts.B += countVal;
          dataCounts.B[stats.year[currYear]] += countVal;
        }
        yearCounts.tot += countVal;
      }

      totalStats = updateTotalStats(
        totalStats,
        yearCounts,
        stats.year[currYear]
      );
    }
  }

  const datasets = [
    {
      label: 'A',
      data: dataCounts.A,
      backgroundColor: '#415e98',
    },
    {
      label: 'B',
      data: dataCounts.B,
      backgroundColor: '#657cab',
    }
  ]
  const {data, options} = getGraphicInfo(datasets, stats.year, totalStats, showStatistics, end, init);

  return (
    <>
      <h1>Pontuação Qualis</h1>
      <Bar options={options} data={data} />
      <p>Fonte da pontuação: <a href={areaData.source.url} target="_blank" title={"Visualizar "+areaData.source.label}>{areaData.source.label}</a> da {areaData.label} (ano-base: {areaData.base_year})</p>
    </>
  );
}

export default ScoreGraphicView;
