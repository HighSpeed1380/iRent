/**
 *News Visitors Chart
 * Stacked Bar CHart Component
 */
import React from 'react';
import { Bar } from 'react-chartjs-2';

// chart config
import ChartConfig from 'Constants/chart-config';

function StackedBarChart(props) {
   const { labels, datasets } = props;
   const data = {
      labels,
      datasets
   }
   const options = {
      legend: {
         display: false
      },
      scales: {
         xAxes: [{
            gridLines: {
               color: ChartConfig.chartGridColor
            },
            ticks: {
               fontColor: ChartConfig.axesColor
            },
            display: false
         }],
         yAxes: [{
            gridLines: {
               color: ChartConfig.chartGridColor
            },
            ticks: {
               fontColor: ChartConfig.axesColor
            },
            display: false
         }]
      }
   };
   return (
      <Bar data={data} options={options} height={130} />
   );
}

export default StackedBarChart;