import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Truck,
  AlertTriangle,
  RotateCw,
  PlusCircle,
  FileText,
  Boxes,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeChartTab, setActiveChartTab] = useState("both");

  const [stats, setStats] = useState({
    total_revenue: 0,
    total_cost: 0,
    total_profit: 0,
    total_supply_cost: 0,
    manifest_count: 0,
    daily_stats: [],
    low_stock_count: 0,
  });

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axios.get(`${apiBaseUrl}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setStats({
          total_revenue: response.data.total_revenue || 0,
          total_cost: response.data.total_cost || 0,
          total_profit: response.data.total_profit || 0,
          total_supply_cost: response.data.total_supply_cost || 0,
          manifest_count: response.data.manifest_count || 0,
          daily_stats: response.data.daily_stats || [],
          low_stock_count: response.data.low_stock_count || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    })
      .format(val || 0)
      .replace("LKR", "Rs.");
  };

  // Generate sample trend SVG points if daily_stats is empty or populated
  const renderChart = () => {
    const data = stats.daily_stats && stats.daily_stats.length > 0
      ? stats.daily_stats
      : [
          { loading_date: "Day 1", revenue: 12000, profit: 600 },
          { loading_date: "Day 5", revenue: 28000, profit: 1400 },
          { loading_date: "Day 10", revenue: 19000, profit: 950 },
          { loading_date: "Day 15", revenue: 45000, profit: 2250 },
          { loading_date: "Day 20", revenue: 38000, profit: 1900 },
          { loading_date: "Day 25", revenue: 62000, profit: 3100 },
          { loading_date: "Day 30", revenue: 54000, profit: 2700 },
        ];

    const hasRealData = stats.daily_stats && stats.daily_stats.length > 0;

    const maxRev = Math.max(...data.map((d) => d.revenue || 0), 100);
    const chartHeight = 220;
    const chartWidth = 560;
    const padding = 20;

    const pointsRevenue = data
      .map((d, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - ((d.revenue || 0) / maxRev) * (chartHeight - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    const pointsProfit = data
      .map((d, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - (((d.profit || 0) * 10) / maxRev) * (chartHeight - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="relative w-full overflow-hidden">
        {!hasRealData && (
          <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-inner">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">
              PERFORMANCE DATA PENDING
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
              Live metrics will appear as completed deliveries are recorded
            </span>
          </div>
        )}

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + ratio * (chartHeight - padding * 2)}
              x2={chartWidth - padding}
              y2={padding + ratio * (chartHeight - padding * 2)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area Fills */}
          {(activeChartTab === "both" || activeChartTab === "revenue") && (
            <polygon
              points={`${padding},${chartHeight - padding} ${pointsRevenue} ${
                chartWidth - padding
              },${chartHeight - padding}`}
              fill="url(#gradRevenue)"
            />
          )}

          {(activeChartTab === "both" || activeChartTab === "profit") && (
            <polygon
              points={`${padding},${chartHeight - padding} ${pointsProfit} ${
                chartWidth - padding
              },${chartHeight - padding}`}
              fill="url(#gradProfit)"
            />
          )}

          {/* Lines */}
          {(activeChartTab === "both" || activeChartTab === "revenue") && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsRevenue}
            />
          )}

          {(activeChartTab === "both" || activeChartTab === "profit") && (
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsProfit}
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
            <span>Daily Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
            <span>Commission Profit (5%)</span>
          </div>
        </div>
      </div>
    );
  };

  const displayName = user?.name || user?.username || "User";

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Live System
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-blue-600">{displayName}</span>. Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-medium">
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === "30d"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === "7d"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatCurrency(stats.total_revenue)}
          </h3>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span>Total Billed From Loadings</span>
          </p>
        </div>

        {/* Card 2: Total Commission (Profit) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Sparkles className="w-3 h-3" />
              Active
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Commission (Profit)
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatCurrency(stats.total_profit)}
          </h3>
          <p className="text-xs text-emerald-600 font-medium mt-2">
            Flat 5% Commission
          </p>
        </div>

        {/* Card 3: Total Supply Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
              Records
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Supply Cost
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatCurrency(stats.total_supply_cost)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Total Supplier Billing
          </p>
        </div>

        {/* Card 4: Delivered Manifests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Today
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Delivered Manifests
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {stats.manifest_count} <span className="text-base font-medium text-slate-500">Ships</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Outbound Dispatch Items
          </p>
        </div>
      </div>

      {/* Main Grid: Chart & Side Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left Column: Revenue vs Profit Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Revenue vs Profit
                </h2>
                <p className="text-xs text-slate-500">
                  Daily performance trends for last 30 days
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveChartTab("both")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "both"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveChartTab("revenue")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "revenue"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setActiveChartTab("profit")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "profit"
                      ? "bg-white text-emerald-600 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Profit
                </button>
              </div>
            </div>

            {renderChart()}
          </div>
        </div>

        {/* Right Column: Low Stock Alert & Quick Action (1/3 width) */}
        <div className="flex flex-col gap-6">
          {/* Low Stock Alert */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Low Stock Alert</h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Action required immediately
                </p>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="my-6">
              <span className="text-4xl font-extrabold tracking-tight">
                {stats.low_stock_count}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-100 mt-1">
                Products At Risk
              </p>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-red-600 hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Restock Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-bold">Quick Action</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Streamline your workflow
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => navigate("/new-supply")}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-center group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  NEW LOAD
                </span>
              </button>

              <button
                onClick={() => navigate("/suppliers")}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-center group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  SUPPLY
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: System Modules */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              System Modules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick access to active inventory and transaction management hub
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Stock Management */}
          <div
            onClick={() => navigate("/products")}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>Stock Management</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Manage products, material codes, and physical inventory levels.
              </p>
            </div>
          </div>

          {/* Module 2: Loading Manifests */}
          <div
            onClick={() => navigate("/loading")}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                <span>Loading Manifests</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Process outbound manifests and track delivery performance.
              </p>
            </div>
          </div>

          {/* Module 3: Supplier Invoices */}
          <div
            onClick={() => navigate("/supply-invoices")}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                <span>Supplier Invoices</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Review incoming stock invoices and monitor supplier payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
