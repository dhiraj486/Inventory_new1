import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import companyLogo from './assests/arniya.jpeg';
import Logout from '../components/logout';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const apiEndpoint = "https://your-api-link.com/data";

const pieColors = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];
const lineColors = {
  lastYear: "#8884d8",
  thisYear: "#82ca9d",
};

const Analytics = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState("1W");
  const [ordersTimeframe, setOrdersTimeframe] = useState("1W");
  const [salesCardTimeframe, setSalesCardTimeframe] = useState("1W");
  const [ordersCardTimeframe, setOrdersCardTimeframe] = useState("1W");
  const [customersCardTimeframe, setCustomersCardTimeframe] = useState("1W");
  const [salesGraphData, setSalesGraphData] = useState([]);
  const [ordersPieData, setOrdersPieData] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorSales, setErrorSales] = useState(null);
  const [errorOrders, setErrorOrders] = useState(null);
  const [chartType, setChartType] = useState("line");

  const fetchSalesData = useCallback(async (timeframe) => {
    setLoadingSales(true);
    setErrorSales(null);
    try {
      const response = await fetch(`${apiEndpoint}?type=sales&timeframe=${timeframe}`);
      const data = await response.json();
      setSalesGraphData(data.graphData || []);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      setErrorSales("Failed to load sales data.");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const fetchOrdersData = useCallback(async (timeframe) => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      const response = await fetch(`${apiEndpoint}?type=orders&timeframe=${timeframe}`);
      const data = await response.json();
      setOrdersPieData(data.pieData || []);
    } catch (error) {
      console.error("Failed to fetch orders data:", error);
      setErrorOrders("Failed to load orders data.");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login");
  };

  useEffect(() => {
    fetchSalesData(salesTimeframe);
  }, [salesTimeframe, fetchSalesData]);

  useEffect(() => {
    fetchOrdersData(ordersTimeframe);
  }, [ordersTimeframe, fetchOrdersData]);

  const totalSales = salesGraphData.reduce((sum, entry) => sum + (entry.thisYear || 0), 0);
  const prevSales = salesGraphData.reduce((sum, entry) => sum + (entry.lastYear || 0), 0);
  const salesChange = calculateChange(totalSales, prevSales);

  const totalOrders = ordersPieData.reduce((sum, entry) => sum + (entry.value || 0), 0);
  const prevOrders = ordersPieData.reduce((sum, entry) => sum + (entry.previous || 0), 0);
  const ordersChange = calculateChange(totalOrders, prevOrders);

  const totalCustomers = ordersPieData.reduce((sum, entry) => sum + (entry.value || 0), 0);
  const prevCustomers = ordersPieData.reduce((sum, entry) => sum + (entry.previous || 0), 0);
  const customersChange = calculateChange(totalCustomers, prevCustomers);

  function calculateChange(current, previous) {
    if (previous === 0 && current === 0) return { text: "0%", color: "#9E9E9E", icon: "⬇" };
    if (previous === 0 && current > 0) return { text: "+100%", color: "#4CAF50", icon: "⬆" };
    if (previous > 0 && current === 0) return { text: "-100%", color: "#F44336", icon: "⬇" };

    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    const isPositive = percentChange >= 0;

    return {
      text: `${isPositive ? "+" : ""}${percentChange.toFixed(1)}%`,
      color: isPositive ? "#4CAF50" : "#F44336",
      icon: isPositive ? "⬆" : "⬇",
    };
  }

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <img src={companyLogo} alt="Logo" style={styles.logoImg} />
        <h2 style={styles.logo}>ARNIYA</h2>
        <nav style={styles.nav}>
          <button style={styles.navItem} onClick={() => navigate("/Dashboard")}>🏠 Dashboard</button>
          <button style={styles.navItem} onClick={() => navigate("/product")}>📦 Product</button>
          <button style={styles.navItem} onClick={() => navigate("/customer")}>👥 Customer</button>
          <button style={styles.navItem} onClick={() => navigate("/analytics")}>📊 Analytics</button>
          <button style={styles.navItem} onClick={() => navigate("/setting")}>⚙️ Setting</button>
          <button
            style={styles.navItemLogout}
            onClick={() => setIsModalOpen(true)} // Open modal on click
            >
            🚪 Log Out
            </button>
        </nav>
      </aside>
      <main style={styles.dashboardContent}>
        <section style={styles.topCards}>
          <Card
            title="Total Sales"
            color="#4CAF50"
            amount={`$${totalSales.toLocaleString()}`}
            change={salesChange}
            timeframe={salesCardTimeframe}
            setTimeframe={setSalesCardTimeframe}
          />
          <Card
            title="Total Orders"
            color="#F44336"
            amount={totalOrders.toLocaleString()}
            change={ordersChange}
            timeframe={ordersCardTimeframe}
            setTimeframe={setOrdersCardTimeframe}
          />
          <Card
            title="Total Customers"
            color="#2196F3"
            amount={totalCustomers.toLocaleString()}
            change={customersChange}
            timeframe={customersCardTimeframe}
            setTimeframe={setCustomersCardTimeframe}
          />
        </section>
        <section style={styles.graphSection}>
          <div style={styles.graphHeader}>
            <h3>Overall Sales</h3>
            <div style={styles.graphControls}>
              <TimeframeButtons
                current={salesTimeframe}
                setTimeframe={setSalesTimeframe}
              />
              <button
                onClick={() =>
                  setChartType(chartType === "line" ? "bar" : "line")
                }
                style={styles.toggleButton}
              >
                {chartType === "line" ? "Bar Chart" : "Line Chart"}
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "line" ? (
              <LineChart data={salesGraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="lastYear"
                  stroke={lineColors.lastYear}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="thisYear"
                  stroke={lineColors.thisYear}
                  animationDuration={800}
                />
              </LineChart>
            ) : (
              <BarChart data={salesGraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="lastYear"
                  fill={lineColors.lastYear}
                  animationDuration={800}
                />
                <Bar
                  dataKey="thisYear"
                  fill={lineColors.thisYear}
                  animationDuration={800}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </section>
        <section style={styles.pieSection}>
          <div style={styles.graphHeader}>
            <h3>Order Report</h3>
            <TimeframeButtons
              current={ordersTimeframe}
              setTimeframe={setOrdersTimeframe}
            />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ordersPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
                animationDuration={800}
              >
                {ordersPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </main>
            <Logout
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)} // Close modal
              onConfirm={handleLogout} // Confirm logout
            />
    </div>
  );
};

export default Analytics;
const Card = ({ title, color, amount, change, timeframe, setTimeframe }) => (
  <div style={{ ...styles.card, borderTop: `5px solid ${color}` }}>
    <div style={styles.cardHeader}>
      <h3>{title}</h3>
      <TimeframeButtons current={timeframe} setTimeframe={setTimeframe} />
    </div>
    <div>
      <h2>{amount}</h2>
      <p style={{ color: change.color }}>
        {change.icon} {change.text} vs last period
      </p>
    </div>
  </div>
);

const TimeframeButtons = ({ current, setTimeframe }) => {
  const timeframes = ["1W", "1M", "6M", "1Y"];
  return (
    <div style={styles.timeframeButtonContainer}>
      {timeframes.map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          style={{
            ...styles.timeframeButton,
            backgroundColor: current === tf ? "#1976D2" : "#E0E0E0",
            color: current === tf ? "#FFF" : "#000",
          }}
        >
          {tf}
        </button>
      ))}
    </div>
  );
};

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const styles = {
  dashboardContainer: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  sidebar: {
    width: "250px",
    height: "100%",
    backgroundColor: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 15px",
  },
  logo: {
    marginBottom: "30px",
    fontSize: "24px",
    color: "#6c63ff",
    textAlign: "center",
  },
  logoImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  navItem: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "none",
    textAlign: "left",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  navItemLogout: {
    marginTop: "auto",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    textAlign: "left",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  dashboardContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  topCards: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    gap: "15px",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: "250px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  graphSection: {
    marginBottom: "20px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  pieSection: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  graphHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  graphControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  toggleButton: {
    padding: "8px 16px",
    backgroundColor: "#6c63ff",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  timeframeButtonContainer: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#000",
    padding: "2px",
    borderRadius: "8px",
  },
  timeframeWrapper: {
    display: "flex",
  },
  timeframeButton: {
    backgroundColor: "grey",
    color: "#fff",
    border: "none",
    padding: "5px 5px",
    fontSize: "10px", 
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    },
  activeButton: {
    backgroundColor: "#6c63ff",
    color: "#fff",
  },
};
