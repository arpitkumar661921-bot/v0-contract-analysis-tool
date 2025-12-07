"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Plus, Trash2, Edit2, DollarSign, TrendingUp, AlertTriangle, Save } from "lucide-react"

type BudgetItem = {
  id: string
  category: string
  vendor: string
  estimated: number
  actual: number
  paid: number
  notes: string
}

const initialBudgetItems: BudgetItem[] = [
  {
    id: "1",
    category: "Venue",
    vendor: "The Grand Hotel",
    estimated: 18500,
    actual: 18500,
    paid: 9250,
    notes: "50% deposit paid",
  },
  {
    id: "2",
    category: "Catering",
    vendor: "Elite Catering",
    estimated: 12000,
    actual: 9090,
    paid: 0,
    notes: "Menu tasting scheduled",
  },
  {
    id: "3",
    category: "Photography",
    vendor: "Moment Studios",
    estimated: 4000,
    actual: 3500,
    paid: 1000,
    notes: "Package includes video",
  },
  { id: "4", category: "DJ/Entertainment", vendor: "SoundWave", estimated: 2000, actual: 1800, paid: 500, notes: "" },
  {
    id: "5",
    category: "Florist/Decor",
    vendor: "Bloom & Petal",
    estimated: 5000,
    actual: 4200,
    paid: 0,
    notes: "Final design pending",
  },
  { id: "6", category: "Cake", vendor: "Sweet Dreams Bakery", estimated: 800, actual: 750, paid: 0, notes: "" },
  {
    id: "7",
    category: "Attire",
    vendor: "Various",
    estimated: 3000,
    actual: 2800,
    paid: 2000,
    notes: "Dress purchased",
  },
  { id: "8", category: "Invitations", vendor: "Minted", estimated: 500, actual: 450, paid: 450, notes: "Complete" },
]

const categoryColors: Record<string, string> = {
  Venue: "#10b981",
  Catering: "#3b82f6",
  Photography: "#8b5cf6",
  "DJ/Entertainment": "#f59e0b",
  "Florist/Decor": "#ec4899",
  Cake: "#ef4444",
  Attire: "#14b8a6",
  Invitations: "#6366f1",
  Other: "#64748b",
}

export function BudgetPlanner() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems)
  const [totalBudget, setTotalBudget] = useState(50000)
  const [guestCount, setGuestCount] = useState(150)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimated, 0)
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0)
  const totalPaid = budgetItems.reduce((sum, item) => sum + item.paid, 0)
  const remaining = totalBudget - totalActual
  const perGuestCost = Math.round(totalActual / guestCount)

  const chartData = budgetItems.map((item) => ({
    name: item.category,
    value: item.actual,
    color: categoryColors[item.category] || categoryColors["Other"],
  }))

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: "Other",
      vendor: "New Vendor",
      estimated: 0,
      actual: 0,
      paid: 0,
      notes: "",
    }
    setBudgetItems([...budgetItems, newItem])
    setEditingItem(newItem.id)
  }

  const deleteItem = (id: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Total</p>
                <p className="text-2xl font-bold text-foreground">${totalActual.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${remaining >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                {remaining >= 0 ? (
                  <DollarSign className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
                  ${Math.abs(remaining).toLocaleString()}
                  {remaining < 0 && " over"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <DollarSign className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Per Guest</p>
                <p className="text-2xl font-bold text-foreground">${perGuestCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Budget Progress</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="total-budget" className="text-sm whitespace-nowrap">
                Total Budget:
              </Label>
              <Input
                id="total-budget"
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="guests" className="text-sm whitespace-nowrap">
                Guests:
              </Label>
              <Input
                id="guests"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Spent: ${totalActual.toLocaleString()}</span>
                <span className="text-muted-foreground">{Math.round((totalActual / totalBudget) * 100)}%</span>
              </div>
              <Progress value={(totalActual / totalBudget) * 100} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Paid: ${totalPaid.toLocaleString()}</span>
                <span className="text-muted-foreground">{Math.round((totalPaid / totalActual) * 100)}% of total</span>
              </div>
              <Progress value={(totalPaid / totalActual) * 100} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Items Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budget Items</CardTitle>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Vendor</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Estimated</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Actual</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Paid</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-3">
                        {editingItem === item.id ? (
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, "category", e.target.value)}
                            className="h-8 px-2 text-xs rounded border border-input bg-background"
                          >
                            {Object.keys(categoryColors).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: categoryColors[item.category] || categoryColors["Other"] }}
                            />
                            <span className="text-sm">{item.category}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {editingItem === item.id ? (
                          <Input
                            value={item.vendor}
                            onChange={(e) => updateItem(item.id, "vendor", e.target.value)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.vendor}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            value={item.estimated}
                            onChange={(e) => updateItem(item.id, "estimated", Number(e.target.value))}
                            className="h-8 text-xs w-24 ml-auto"
                          />
                        ) : (
                          <span className="text-sm">${item.estimated.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            value={item.actual}
                            onChange={(e) => updateItem(item.id, "actual", Number(e.target.value))}
                            className="h-8 text-xs w-24 ml-auto"
                          />
                        ) : (
                          <span className="text-sm font-medium">${item.actual.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            value={item.paid}
                            onChange={(e) => updateItem(item.id, "paid", Number(e.target.value))}
                            className="h-8 text-xs w-24 ml-auto"
                          />
                        ) : (
                          <span className={`text-sm ${item.paid > 0 ? "text-success" : "text-muted-foreground"}`}>
                            ${item.paid.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex justify-end gap-1">
                          {editingItem === item.id ? (
                            <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                              <Save className="h-4 w-4 text-success" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => setEditingItem(item.id)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={2} className="py-3 px-3 font-medium">
                      Total
                    </td>
                    <td className="py-3 px-3 text-right font-medium">${totalEstimated.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold">${totalActual.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-medium text-success">${totalPaid.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
