import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartConfig } from '../../Util/constants';

const options = {
   legend: {
      display: false
   },
   tooltips: {
      titleSpacing: 6,
      cornerRadius: 7,
      intersect: true
   },
   scales: {
      xAxes: [{
         gridLines: {
            display: false,
            color: ChartConfig.chartGridColor,
            drawBorder: false
         },
         ticks: {
            fontColor: ChartConfig.axesColor
         },
         display: true,
      }],
      yAxes: [{
         gridLines: {
            display: false,
            color: ChartConfig.chartGridColor,
            drawBorder: false
         },
         ticks: {
            fontColor: ChartConfig.axesColor,
         },
         display: false
      }]
   }
};

export default function AgencyWelcomeBarChart(props){
   const { labels, color } = props;
   const data = {
      labels: labels,
      datasets: [
         {
            barPercentage: 2,
            categoryPercentage: 0.3,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            data: props.data
         }
      ]
   }
   return (
      <Bar data={data} options={options} height={150} />
   );
}
