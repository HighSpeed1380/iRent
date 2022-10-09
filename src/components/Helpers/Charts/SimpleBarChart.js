/**
 * Simple Bar Chart Component
 */
import React from 'react';
import { Bar } from 'react-chartjs-2';

const options = {
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      display: false,
    }],
    yAxes: [{
      display: false,
      ticks: {
        beginAtZero: true
      }
    }]
  }
};

function BarChart(props) {
   const { labels, datasets } = props;
   const data = {
      labels,
      datasets
   }
   return (
      <Bar data={data} options={options} height={80} />
   );
}

export default BarChart;