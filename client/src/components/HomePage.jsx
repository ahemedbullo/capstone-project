import React, { useState, useEffect } from "react";
import "./Styles/HomePage.css";
import BudgetChart from "./BudgetChart.jsx";
import BalanceChart from "./BalanceChart.jsx";
import DataFetcher from "./DataFetcher.jsx";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <DataFetcher />
      <div className="homepage">
        <div className="charts-container">
          <div className="chart-wrapper">
            <BudgetChart />
          </div>
          <div className="chart-wrapper">
            <BalanceChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
