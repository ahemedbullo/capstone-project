import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { UserContext } from "../UserContext.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BalanceChart = () => {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentProfile } = useContext(UserContext);

  useEffect(() => {
    fetchTotalBalanceHistory();
  }, [timeRange, currentProfile]);

  const fetchTotalBalanceHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:3000/accounts/total-balance-history/${currentProfile}/${timeRange}`
      );
      const data = response.data;

      setChartData({
        labels: data.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: "Total Balance",
            data: data.map((item) => item.balance),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching total balance history:", error);
      setError("Failed to fetch total balance history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Total Balance History",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Total Balance ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="homepage-balance-chart-container">
      <h2>Total Balance History</h2>
      <div className="chart-controls">
        <div className="date-range-control">
          <span>View: </span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-range-select"
          >
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
          </select>
        </div>
      </div>
      {isLoading && <p>Loading chart data...</p>}
      {error && <p className="error-message">{error}</p>}
      {chartData && !isLoading && !error && (
        <div className="chart-wrapper">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default BalanceChart;
