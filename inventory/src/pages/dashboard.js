import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logout from '../components/logout';
import {  BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,} from "recharts";
// import { FaBell, FaUserCircle } from "react-icons/fa";
import Sidebar from '../components/sidebar';

const Dashboard = () => {
  const API_BASE_URL = "https://example.com/api";
  const navigate = useNavigate();

  const [graphData, setGraphData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [weeklySales, setWeeklySales] = useState({ current: 0, last: 0, change: 0 });
  const [weeklyOrders, setWeeklyOrders] = useState({ current: 0, last: 0, change: 0 });
  const [weeklyCustomers, setWeeklyCustomers] = useState({ current: 0, last: 0, change: 0 });

  const [customerStatusData, setCustomerStatusData] = useState([
    { name: "Active", value: 0 },
    { name: "Inactive", value: 0 },
  ]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const location = useLocation(); // 👈 This gives you the current URL path
  const currentPath = location.pathname;

  console.log("Current location path: ", currentPath);

  const getWeekRange = (date) => {
    const dt = new Date(date);
    const oneJan = new Date(dt.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((dt - oneJan) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((dt.getDay() + 1 + numberOfDays) / 7);
    return `${dt.getFullYear()}-W${week}`;
  };

  const calculateWeeklyMetrics = (salesGraph) => {
    if (!salesGraph || salesGraph.length === 0) return;

    const today = new Date();
    const currentWeek = getWeekRange(today);
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(today.getDate() - 7);
    const lastWeek = getWeekRange(lastWeekDate);

    const currentWeekData = salesGraph.filter((d) => getWeekRange(d.date) === currentWeek);
    const lastWeekData = salesGraph.filter((d) => getWeekRange(d.date) === lastWeek);

    const currentSales = currentWeekData.reduce((acc, val) => acc + val.value, 0);
    const lastSales = lastWeekData.reduce((acc, val) => acc + val.value, 0);
    const salesChange = lastSales !== 0 ? ((currentSales - lastSales) / lastSales) * 100 : 100;

    const currentOrders = currentWeekData.length * 15;
    const lastOrders = lastWeekData.length * 15;
    const ordersChange = lastOrders !== 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 100;

    const currentCustomers = Math.floor(currentOrders * 0.65);
    const lastCustomers = Math.floor(lastOrders * 0.65);
    const customersChange = lastCustomers !== 0 ? ((currentCustomers - lastCustomers) / lastCustomers) * 100 : 100;

    setWeeklySales({ current: currentSales, last: lastSales, change: salesChange.toFixed(1) });
    setWeeklyOrders({ current: currentOrders, last: lastOrders, change: ordersChange.toFixed(1) });
    setWeeklyCustomers({ current: currentCustomers, last: lastCustomers, change: customersChange.toFixed(1) });
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-dashboard-data`);
      const data = await response.json();

      if (data.success) {
        const graphPayload = data.payload.salesGraph || [];
        setGraphData(graphPayload);
        setRecentOrders(data.payload.recentOrders || []);
        calculateWeeklyMetrics(graphPayload);
        setError(null);

        // 👉 Fetch active/inactive customer data from API
        const customerStatsResponse = await fetch(`${API_BASE_URL}/get-customer-status`);
        const customerStatsData = await customerStatsResponse.json();

        if (customerStatsData.success) {
          const activeCount = customerStatsData.payload.active || 0;
          const inactiveCount = customerStatsData.payload.inactive || 0;

          setCustomerStatusData([
            { name: "Active", value: activeCount },
            { name: "Inactive", value: inactiveCount },
          ]);
        } else {
          setError("Failed to fetch customer status data");
        }
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    }
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#0088FE", "#FF8042"];

  const filteredOrders = recentOrders.filter((order) =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <Sidebar setIsModalOpen={setIsModalOpen} />
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1>Welcome, Arinya</h1>
          </div>
          <div style={styles.headerRight}>
            {/* <FaBell style={styles.icon} />
            <FaUserCircle style={styles.icon} /> */}
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <section style={styles.stats}>
          <div style={{ ...styles.statCard, borderColor: "#28a745" }}>
            <h3>Total Sales</h3>
            <p style={{ color: "#28a745", fontSize: "24px" }}>${weeklySales.current.toLocaleString()}</p>
            <small>{weeklySales.change >= 0 ? `↑ ${weeklySales.change}%` : `↓ ${Math.abs(weeklySales.change)}%`} vs last week</small>
          </div>
          <div style={{ ...styles.statCard, borderColor: "#dc3545" }}>
            <h3>Total Orders</h3>
            <p style={{ color: "#dc3545", fontSize: "24px" }}>{weeklyOrders.current.toLocaleString()}</p>
            <small>{weeklyOrders.change >= 0 ? `↑ ${weeklyOrders.change}%` : `↓ ${Math.abs(weeklyOrders.change)}%`} vs last week</small>
          </div>
          <div style={{ ...styles.statCard, borderColor: "#17a2b8" }}>
            <h3>Total Customers</h3>
            <p style={{ color: "#17a2b8", fontSize: "24px" }}>{weeklyCustomers.current.toLocaleString()}</p>
            <small>{weeklyCustomers.change >= 0 ? `↑ ${weeklyCustomers.change}%` : `↓ ${Math.abs(weeklyCustomers.change)}%`} vs last week</small>
          </div>
        </section>

        <section style={styles.charts}>
          <div style={styles.chartCard}>
            <h4>Overall Sales</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.chartCard}>
            <h4>Customer Report</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={customerStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                >
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section style={styles.ordersSection}>
          <h4>Recent Orders</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>{order.date}</td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td>${order.totalAmount}</td>
                    <td>{order.status}</td>
                    <td><button onClick={() => navigate(`/order/${order.orderNumber}`)}>Details →</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7">No orders found</td></tr>
              )}
            </tbody>
          </table>
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

export default Dashboard;

const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    height: "100vh",
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    padding: "20px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  headerLeft: {},
  headerRight: {
    display: "flex",
    gap: "10px",
  },
  icon: {
    fontSize: "24px",
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    flex: "1",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    borderLeft: "5px solid",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  charts: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  ordersSection: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    margin: "10px 0 20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableThTd: {
    borderBottom: "1px solid #dee2e6",
    padding: "10px",
  },
  logoImg: {
    height: "50px",         
    width: "50px",          
    borderRadius: "50%",
    margin: "0 auto 15px",
  },
};