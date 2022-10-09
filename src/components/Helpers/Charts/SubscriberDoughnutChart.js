import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import ChartConfig from 'Constants/chart-config';

const data = {
   labels: [
      'Series 1',
      'Series 2',
      'Series 3'
   ],
   datasets: [{
      data: [250, 25, 50],
      backgroundColor: [
         ChartConfig.color.primary,
         ChartConfig.color.warning,
         ChartConfig.color.success
      ],
      hoverBackgroundColor: [
         ChartConfig.color.primary,
         ChartConfig.color.warning,
         ChartConfig.color.success
      ]
   }]
};

const options = {
   legend: {
      display: false,
      labels: {
         fontColor: ChartConfig.legendFontColor
      }
   },
   cutoutPercentage: 70
};

function SubscriberDoughnutChart() {
   return (
      <Doughnut data={data} options={options} height={150} />
   );
}

export default SubscriberDoughnutChart