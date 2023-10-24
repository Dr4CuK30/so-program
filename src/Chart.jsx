import PropTypes from "prop-types";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function generateDatasets(usersData, currentClient, time, handledUsers) {
  const dataset = [];
  dataset.push(
    ...handledUsers.map((user) => ({
      label: user.Name,
      backgroundColor: "rgba(246,156,85,1)",
      borderColor: "rgba(246,156,85,1)",
      pointBackgroundColor: "rgba(246,156,85,1)",
      pointBorderColor: "rgba(246,156,85,1)",
      pointRadius: 5,
      data: [
        { x: user.TimeOfArrival, y: user.Name },
        { x: user.HandleStartTime, y: user.Name },
      ],
    }))
  );
  dataset.push(
    ...handledUsers.map((user) => ({
      label: user.Name,
      backgroundColor: "rgba(0,102,204,1)",
      borderColor: "rgba(0,102,204,1)",
      pointBackgroundColor: "rgba(0,102,204,1)",
      pointBorderColor: "rgba(0,102,102,1)",
      pointRadius: 5,
      data: [
        { x: user.HandleStartTime, y: user.Name },
        { x: user.FinishTime, y: user.Name },
      ],
    }))
  );
  if (currentClient) {
    dataset.push(
      {
        label: currentClient.Name,
        backgroundColor: "rgba(246,156,85,1)",
        borderColor: "rgba(246,156,85,1)",
        pointBackgroundColor: "rgba(246,156,85,1)",
        pointBorderColor: "rgba(246,156,85,1)",
        pointRadius: 5,
        data: [
          { x: currentClient.TimeOfArrival, y: currentClient.Name },
          { x: currentClient.HandleStartTime, y: currentClient.Name },
        ],
      },
      {
        label: currentClient.Name,
        backgroundColor: "rgba(0,102,204,1)",
        borderColor: "rgba(0,102,204,1)",
        pointBackgroundColor: "rgba(0,102,204,1)",
        pointBorderColor: "rgba(0,102,102,1)",
        pointRadius: 5,
        data: [
          { x: currentClient.HandleStartTime, y: currentClient.Name },
          { x: time, y: currentClient.Name },
        ],
      }
    );
  }
  const copiedData = [...usersData];
  copiedData.shift();
  dataset.push(
    ...copiedData.map((user) => ({
      label: user.Name,
      backgroundColor: "rgba(246,156,85,1)",
      borderColor: "rgba(246,156,85,1)",
      pointBackgroundColor: "rgba(246,156,85,1)",
      pointBorderColor: "rgba(246,156,85,1)",
      pointRadius: 5,
      data: [
        { x: user.TimeOfArrival, y: user.Name },
        { x: time, y: user.Name },
      ],
    }))
  );
  return dataset;
}

export default function LinesChart(props) {
  const { usersData, clientHandled, time, handledUsers } = props;
  const datasets = generateDatasets(
    usersData,
    clientHandled,
    time,
    handledUsers
  );
  return (
    <div className='chart'>
      <Scatter
        options={{
          animation: false,
          showLine: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
            y: {
              type: "category",
            },
          },
        }}
        data={{
          datasets: datasets,
        }}
      />
    </div>
  );
}

LinesChart.propTypes = {
  usersData: PropTypes.array,
  clientHandled: PropTypes.object,
  time: PropTypes.number,
  handledUsers: PropTypes.array,
};
