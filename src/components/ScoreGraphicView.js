import '../App.css';
import CanvasJSReact from './canvasjs-3.7.5/canvasjs.react';

// get Qualis score for given category
function getQualisScore(qualisCategory, count) {
  const qualisScores = {
    A1: 100,
    A2: 85,
    A3: 70,
    A4: 55,
    B1: 40,
    B2: 30,
    B3: 20,
    B4: 10,
    C: 0,
    N: 0,
  };
  return qualisScores[qualisCategory] * count;
}

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

  yearTotalCounts = Object.keys(yearTotalCounts).map(key => ({label: key, y: yearTotalCounts[key]}))
  
  const options = {
    animationEnabled: true,
    legend: {
      verticalAlign: "top",
      horizontalAlign: "center",
      fontSize: 16,
      fontFamily: "lato",
      fontColor: "black",
    },
    axisX:{
      labelFontFamily: "lato",
      labelFontSize: 20,
      labelFontColor: "black",
    },
		dataPointMaxWidth: 100,
    data: [
    {
      type: "column",
      name: "Pontos acumulados",
      color: '#415e98',
      showInLegend: true,
      dataPoints: yearTotalCounts
    }
    ]
  };

  return (
    <>
      <h1>Pontuação Qualis</h1>
      <CanvasJSReact.CanvasJSChart options={options}/>
    </>
  );
}

export default ScoreGraphicView;
