/**
 * Horizontal Bar Chart
 */

import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { ChartConfig } from '../../Util/constants';

// Main Component
function HorizontalBarChart(props) {
   const { labels, label, chartdata, height, max } = props;
   const chartMax = parseInt(max) +1000;
      
   const data = () => {
      return {
         labels: labels,
         datasets: [
            {
               barPercentage: 1.0,
               categoryPercentage: 0.45,
               label: label,
               backgroundColor: ChartConfig.color.info,
               borderColor: ChartConfig.color.info,
               borderWidth: 1,
               hoverBackgroundColor: ChartConfig.color.info,
               hoverBorderColor: ChartConfig.color.info,
               data: chartdata,
            }
         ]
      }
   }
   // chart options
   const options = {
      legend: {
         display: false
      },
      scales: {
         xAxes: [{
            gridLines: {
               color: ChartConfig.chartGridColor,
               drawBorder: false
            },
            ticks: {
               fontColor: ChartConfig.axesColor,
               min: 0,
               max: parseInt(chartMax)
            },
         }],
         yAxes: [{
            gridLines: {
               display: false
            },
            ticks: {
               fontColor: ChartConfig.axesColor
            },
         }]
      }
   };

   return (
      <HorizontalBar data={data} options={options} height={height} />
   );
}

export default HorizontalBarChart;