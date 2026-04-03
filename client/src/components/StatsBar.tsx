import React, { useState, useEffect } from 'react';
import { Wine, TrendingUp, Package, Wallet, Clock, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsBarProps {
  stats: {
    total: number;
    totalValue: number;
    totalBottles: number;
    totalCost: number;
    totalOtherExpenses: number;
    totalFull: number;
    totalHalf: number;
    totalQuarter: number;
    total900ml: number;
  };
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}> = ({ icon, label, value, color, delay }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
  >
    <div className="stat-icon" style={{ background: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </motion.div>
);

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
  const dateString = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="stats-bar">
      <StatCard
        icon={<Wine size={20} />}
        label="Total Varieties"
        value={stats.total.toString()}
        color="linear-gradient(135deg, #8b1a2f, #c0392b)"
        delay={0.1}
      />
      
      {/* Bottle Sizes Section */}
      <StatCard
        icon={<Package size={20} />}
        label="Full Bottles"
        value={stats.totalFull.toString()}
        color="linear-gradient(135deg, #1e293b, #334155)"
        delay={0.2}
      />
      <StatCard
        icon={<Package size={20} />}
        label="Half Bottles"
        value={stats.totalHalf.toString()}
        color="linear-gradient(135deg, #0f172a, #1e293b)"
        delay={0.25}
      />
      <StatCard
        icon={<Package size={20} />}
        label="Quarter Bottles"
        value={stats.totalQuarter.toString()}
        color="linear-gradient(135deg, #312e81, #4338ca)"
        delay={0.3}
      />
      <StatCard
        icon={<Package size={20} />}
        label="900 ML Bottles"
        value={stats.total900ml.toString()}
        color="linear-gradient(135deg, #3730a3, #4f46e5)"
        delay={0.35}
      />

      <StatCard
        icon={<TrendingUp size={20} />}
        label="Total Bottles"
        value={stats.totalBottles.toString()}
        color="linear-gradient(135deg, #2c1810, #8b4513)"
        delay={0.4}
      />
      <StatCard
        icon={<Wallet size={20} />}
        label="Total Cost"
        value={`₹${stats.totalCost.toLocaleString('en-IN')}`}
        color="linear-gradient(135deg, #1a3a5c, #2980b9)"
        delay={0.45}
      />
      <StatCard
        icon={<Receipt size={20} />}
        label="Other Expenses"
        value={`₹${(stats.totalOtherExpenses || 0).toLocaleString('en-IN')}`}
        color="linear-gradient(135deg, #7c3aed, #4f46e5)"
        delay={0.5}
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        label="Cellar Value"
        value={`₹${stats.totalValue.toLocaleString('en-IN')}`}
        color="linear-gradient(135deg, #5a3e00, #c9a96e)"
        delay={0.55}
      />
      <StatCard
        icon={<Clock size={20} />}
        label={dateString}
        value={timeString}
        color="linear-gradient(135deg, #10b981, #059669)"
        delay={0.6}
      />
    </div>
  );
};
