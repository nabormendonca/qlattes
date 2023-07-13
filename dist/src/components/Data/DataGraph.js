
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
} from "reactstrap";

import {
  updateTotalStats,
  getGraphicInfo
} from '../../utils';

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

const DataGraph = ({
  graphName,
  stats,
  showStatistics,
  end,
  init,
  areaData
}) => {
  // Init data arrays
  const years = stats.year;
  const qualis = {
    A1: Array(years.length).fill(0),
    A2: Array(years.length).fill(0),
    A3: Array(years.length).fill(0),
    A4: Array(years.length).fill(0),
    B1: Array(years.length).fill(0),
    B2: Array(years.length).fill(0),
    B3: Array(years.length).fill(0),
    B4: Array(years.length).fill(0),
    C: Array(years.length).fill(0),
    N: Array(years.length).fill(0),
  }
  const dataCols = Object.keys(qualis);
  let dataCounts = {
    "A" : {},
    "B" : {},
    "C" : {},
    "N" : {},
    tot: {},
  }
  let totalStats = {};
  for (const key of Object.keys(dataCounts)) {
    totalStats[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
  }
  for (const year of stats.year) {
    if (year >= init && year <= end) {
      for (const count of Object.keys(dataCounts)) {
        dataCounts[count][year] = 0;
      }
    }
  }

  // Get row datas
  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      // reset year counts
      let yearCounts = {};
      for (const count of Object.keys(dataCounts)) {
        yearCounts[count] = 0;
      }

      for (const key of dataCols) {
        const keyChar = key.slice(0, 1);
        const value = (areaData && areaData.scores && key in areaData.scores)
          ? areaData.scores[key]*stats[key][currYear] : stats[key][currYear];
        dataCounts[keyChar][stats.year[currYear]] += value;
        yearCounts[keyChar] += value;
        yearCounts.tot += value;
      }

      totalStats = updateTotalStats(
        totalStats,
        yearCounts,
        stats.year[currYear]
      );
    }
  }

  // Get datasets
  const datasets = areaData && areaData.scores ? [
    {
      label: 'A',
      data: Object.values(dataCounts.A),
      backgroundColor: '#415e98',
    },
    {
      label: 'B',
      data: Object.values(dataCounts.B),
      backgroundColor: '#657cab',
    }
  ]
  : [
    {
      label: 'A',
      data: Object.values(dataCounts.A),
      backgroundColor: '#415e98',
    },
    {
      label: 'B',
      data: Object.values(dataCounts.B),
      backgroundColor: '#657cab',
    },
    {
      label: 'C',
      data: Object.values(dataCounts.C),
      backgroundColor: '#9dabc9',
    },
    {
      label: 'N',
      data: Object.values(dataCounts.N),
      backgroundColor: '#c3cbde',
    }
  ]

  const {data, options} = getGraphicInfo(datasets, stats.year, totalStats, showStatistics, end, init);

  return (
    <Row>
      <Col className="mb-5 mb-xl-0" xl="8">
        <Card className="shadow">
          <CardHeader className="bg-transparent">
            <Row className="align-items-center">
              <div className="col">
                <h2 className="mb-0">{graphName}</h2>
              </div>
            </Row>
          </CardHeader>
          <CardBody>
            <Bar
              data={data}
              options={options}
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default DataGraph;
