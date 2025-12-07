"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts"

const scansByMonth = [
  { month: "Jul", scans: 4 },
  { month: "Aug", scans: 8 },
  { month: "Sep", scans: 12 },
  { month: "Oct", scans: 9 },
  { month: "Nov", scans: 15 },
]

const feesByCategory = [
  { name: "Service Charges", value: 4500 },
  { name: "Cleaning Fees", value: 1200 },
  { name: "Overtime", value: 800 },
  { name: "Corkage", value: 450 },
  { name: "Other", value: 500 },
]

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6366f1"]

const savingsOverTime = [
  { month: "Jul", saved: 500 },
  { month: "Aug", saved: 1200 },
  { month: "Sep", saved: 2100 },
  { month: "Oct", saved: 3000 },
  { month: "Nov", saved: 4200 },
]

const riskDistribution = [
  { name: "Low Risk", value: 5 },
  { name: "Medium Risk", value: 4 },
  { name: "High Risk", value: 3 },
]

const RISK_COLORS = ["#22c55e", "#eab308", "#ef4444"]

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Scans</p>
            <p className="text-3xl font-bold text-foreground">48</p>
            <p className="text-xs text-teal-500 mt-1">+15 this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hidden Fees Found</p>
            <p className="text-3xl font-bold text-red-500">₹7,450</p>
            <p className="text-xs text-muted-foreground mt-1">Avg ₹155/contract</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Money Saved</p>
            <p className="text-3xl font-bold text-green-500">₹4,200</p>
            <p className="text-xs text-muted-foreground mt-1">Through negotiations</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            <p className="text-3xl font-bold text-yellow-500">5.8</p>
            <p className="text-xs text-muted-foreground mt-1">Out of 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Scans by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scansByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="scans" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Hidden Fees by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value}`}
                    labelLine={{ stroke: "#9ca3af" }}
                  >
                    {feesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                    formatter={(value: number) => [`₹${value}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {feesByCategory.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Money Saved Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsOverTime} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Saved"]}
                  />
                  <Area type="monotone" dataKey="saved" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Contract Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: "#9ca3af" }}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: "#9ca3af" }}>{value}</span>}
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
