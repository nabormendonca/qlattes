import React from 'react';

// reactstrap components
import {
  Card,
  CardHeader,
  Row,
  Col,
} from "reactstrap";

import {
  linearRegression,
  roundNumber
} from "../../utils"

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

const DataTable = ({
  tableName,
  init,
  end,
  stats,
  showStatistics,
  areaData
}) => {
  init = Number(init);
  end = Number(end);

  // Init data arrays
  const years = stats.year.filter(year => year >= init && year <= end).map(year => year.toString());
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
  const totals = {
    A: Array(years.length).fill(0),
    B: Array(years.length).fill(0),
    all: Array(years.length).fill(0)
  };
  const percentages = {
    A: Array(years.length).fill(0),
    B: Array(years.length).fill(0),
  };
  const totalStats = {
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    B1: 0,
    B2: 0,
    B3: 0,
    B4: 0,
    C: 0,
    N: 0,
    '#A': 0,
    '#B': 0,
    '#all': 0,
    '%A': 0,
    '%B': 0,
  }

  // Reset total statistics
  let statistics = {};
  for (const key of ['#A', '#B', '#all', '%A', '%B']) {
    statistics[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
  }

  // Get row datas
  for (let currYear = 0; currYear < years.length; currYear++) {
    // se o ano do stats nao estiver no meio do intervalo, pula
    if (stats.year[currYear] < init && stats.year[currYear] > end) continue;
    
    // create cells with data cols
    for (const key of Object.keys(qualis)) {
      const keyChar = key.slice(0, 1);

      // value
      const currentValue = (areaData && areaData.scores && key in areaData.scores)
        ? areaData.scores[key]*stats[key][currYear] : stats[key][currYear];

      // Qualis columns
      qualis[key][currYear] = currentValue;

      // Total columns
      totals.all[currYear] += currentValue;
      if (['A', 'B'].includes(keyChar)) {
        totals[keyChar][currYear] += currentValue;
        percentages[keyChar][currYear] += currentValue;
      }

      // Total row
      totalStats[key] += currentValue;
      totalStats['#all'] += currentValue;
      if (['A', 'B'].includes(keyChar)) {
        totalStats['#'+keyChar] += currentValue;
        totalStats['%'+keyChar] += currentValue;
      }
    }

    percentages.A[currYear] = totals.all[currYear]===0 ? 0 : (percentages.A[currYear]/totals.all[currYear]*100);
    percentages.B[currYear] = totals.all[currYear]===0 ? 0 : (percentages.B[currYear]/totals.all[currYear]*100);

    // Update statistics
    const yearCounts = {
      '#A': totals.A[currYear],
      '#B': totals.B[currYear],
      '#all': totals.all[currYear],
      '%A': percentages.A[currYear],
      '%B': percentages.B[currYear]
    };
    for (const key of Object.keys(statistics)) {
      // update total stats lists
      statistics[key].countList.push(yearCounts[key]);
      statistics[key].yearList.push(stats.year[currYear]);

      // update total stats best
      if (yearCounts[key] >= statistics[key].best.count) {
        statistics[key].best.count = yearCounts[key];
        statistics[key].best.year = stats.year[currYear];
      }
    }
  }
  
  // Create header from data arrays
  const header = ["Ano"].concat(Object.keys(qualis))
    .concat(Object.keys(totals).map(item => item === "all" ? "Total" : "Tot " + item))
    .concat(Object.keys(percentages).map(item => "% " + item));
  const headerLegend = areaData && areaData.scores && [""].concat(Object.keys(qualis).map(item => areaData.scores[item]))
    .concat(Object.keys(totals).map(item => ""))
    .concat(Object.keys(percentages).map(item => ""));

  // Create footer from data arrays
  const footer = ["Total"].concat(Object.values(totalStats).map(number => roundNumber(number)));

  // Get statistics
  const mean = ["Média"].concat(Object.keys(qualis).map(item => ""));
  const median = ["Mediana"].concat(Object.keys(qualis).map(item => ""));
  const trend = ["Tendência"].concat(Object.keys(qualis).map(item => ""));
  const bestYear = ["Melhor ano"].concat(Object.keys(qualis).map(item => ""));
  for (const col of Object.keys(statistics)) {
    mean.push(statistics[col].countList == 0 ? 0 : statistics[col].countList.mean().toFixed(2));
    median.push(statistics[col].countList == 0 ? 0 : statistics[col].countList.median().toFixed(2));
    trend.push(statistics[col].countList == 0 ? 0 : linearRegression(statistics[col].yearList, statistics[col].countList).slope.toFixed(2));
    bestYear.push(statistics[col].best.year > 0 ? statistics[col].best.year : '');
  }

  // Set rows
  const rows = years.map((year, index) =>
    <React.Fragment>
      <TableCell scope="row">{year}</TableCell>
      {Object.values(qualis).map(item => <TableCell>{roundNumber(item[index])}</TableCell>)}
      {Object.values(totals).map(item => <TableCell>{roundNumber(item[index])}</TableCell>)}
      {Object.values(percentages).map(item => <TableCell>{roundNumber(item[index])}</TableCell>)}
    </React.Fragment>
  ).reverse();

  // Set Table Height
  const tableHeight = `${showStatistics ? Math.min(636, rows.length * 53 + 320) : Math.min(424, rows.length * 53 + 108)}px !important`;

  return (
    <Row>
      <Col className="mb-5 mb-xl-0" xl="12">
        <Card className="shadow">
          <CardHeader className="border-0">
            <Row className="align-items-center">
              <div className="col">
                <h3 className="mb-0">{tableName}</h3>
              </div>
            </Row>
          </CardHeader>
          <TableVirtuoso
            data={rows}
            components={{
              Scroller: React.forwardRef((props, ref) => ( <TableContainer component={Paper} {...props} ref={ref} /> )),
              Table: (props) => ( <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} /> ),
              TableHead,
              TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
              TableBody: React.forwardRef((props, ref) => ( <TableBody {...props} ref={ref} /> )),
            }}
            itemContent={ (_index, row) => row}
            fixedHeaderContent={() => {
              return (<>
                <TableRow >
                  {header.map((item, index) =>
                    <TableCell 
                      scope="col"
                      style={{ borderBottom: 'none', width: index === 0 ? 110 : 50 }}
                      variant="head"
                      align={'left'}
                      sx={{
                        backgroundColor: '#F6F9FC',
                      }}
                    >
                      {item}
                    </TableCell>)
                  }
                </TableRow>
                {typeof areaData !== 'undefined' &&
                  <TableRow
                    sx={{
                      backgroundColor: '#F6F9FC',
                    }}
                  >
                    {Array.isArray(headerLegend) && headerLegend.map(item => <TableCell scope="col" style={{borderTop: 'none'}}>{item}</TableCell>)}
                  </TableRow>
                }
              </>);
            }}
            fixedFooterContent={() => {
              return ( <>
                <TableRow
                  sx={{
                    backgroundColor: '#F6F9FC',
                  }}
                >
                  {footer.map(item => <TableCell scope="col" style={{ borderBottom: 'none' }}>{item}</TableCell>)}
                </TableRow>
                {showStatistics && (<>
                  <TableRow
                    sx={{
                      backgroundColor: '#F6F9FC',
                    }}
                  >
                    {mean.map(item => <TableCell scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</TableCell>)}
                  </TableRow>
                  <TableRow
                    sx={{
                      backgroundColor: '#F6F9FC',
                    }}
                  >
                    {median.map(item => <TableCell scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</TableCell>)}
                  </TableRow>
                  <TableRow
                    sx={{
                      backgroundColor: '#F6F9FC',
                    }}
                  >
                    {trend.map(item => <TableCell scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</TableCell>)}
                  </TableRow>
                  <TableRow
                    sx={{
                      backgroundColor: '#F6F9FC',
                    }}
                  >
                    {bestYear.map(item => <TableCell scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</TableCell>)}
                  </TableRow>
                </>)}
              </>);
            }}
            sx={{
              height: tableHeight,
              boxShadow: '0 0 2rem 0 rgba(136,152,170,.15)!important'
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DataTable;
