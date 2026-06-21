"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaUsers, FaUserPlus, FaClock, FaMoneyBillWave } from "react-icons/fa";

interface Props {
  stats: {
    totalEtudiants: number; newThisWeek: number; pending: number;
    totalRevenue: number; chartData: { mois: string; count: number }[];
  };
}

export default function AdminDashboardClient({ stats }: Props) {
  const t = useTranslations("admin");

  const kpis = [
    { label: t("totalStudents"), value: stats.totalEtudiants, icon: FaUsers, color: "bg-blue-500", suffix: "" },
    { label: t("newThisWeek"), value: stats.newThisWeek, icon: FaUserPlus, color: "bg-green-500", suffix: "" },
    { label: t("pending"), value: stats.pending, icon: FaClock, color: "bg-orange-500", suffix: "" },
    { label: t("totalRevenue"), value: Math.round(stats.totalRevenue / 1000), icon: FaMoneyBillWave, color: "bg-ids-red", suffix: "k FCFA" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ids-black mb-1">{t("dashboard")}</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="text-white" size={18} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-ids-black">
              {kpi.value.toLocaleString()}
              {kpi.suffix && <span className="text-base font-normal text-gray-400 ml-1">{kpi.suffix}</span>}
            </p>
            <p className="text-gray-400 text-xs mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-display font-bold text-ids-black mb-6">{t("newThisWeek")}</h2>
        {stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} cursor={{ fill: "#f5f5f5" }} />
              <Bar dataKey="count" name={t("students")} fill="#CC0000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-300 text-sm">—</div>
        )}
      </motion.div>
    </div>
  );
}