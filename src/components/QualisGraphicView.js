import '../App.css';
import CanvasJSReact from './canvasjs-3.7.5/canvasjs.react';

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

  for (const count of Object.keys(yearTotalCounts)) {
    yearTotalCounts[count] = Object.keys(yearTotalCounts[count]).map(key => ({label: key, y: yearTotalCounts[count][key]}))
  }

  const data = [
    {
      type: "stackedColumn",
      name: "A",
      color: '#415e98',
      showInLegend: true,
      dataPoints: yearTotalCounts.A
    },
    {
      type: "stackedColumn",
      name: "B",
      color: '#657cab',
      showInLegend: true,
      dataPoints: yearTotalCounts.B
    },
    {
      type: "stackedColumn",
      name: "C",
      color: '#9dabc9',
      showInLegend: true,
      dataPoints: yearTotalCounts.C
    },
    {
      type: "stackedColumn",
      name: "N",
      color: '#c3cbde',
      showInLegend: true,
      dataPoints: yearTotalCounts.N
    }];

  const options = {
    animationEnabled: true,
    axisX:{
      labelFontFamily: "lato",
      labelFontSize: 20,
      labelFontColor: "black",
    },
    toolTip: {
      shared: true,
      reversed: true
    },
    legend: {
      verticalAlign: "top",
      horizontalAlign: "center",
      fontSize: 16,
      fontFamily: "lato",
      fontColor: "black",
    },
    data: data
  };

  return (
    <>
      <h1>Estrato Qualis</h1>
      <CanvasJSReact.CanvasJSChart options={options}/>
    </>
  );
}

export default QualisGraphicView;
