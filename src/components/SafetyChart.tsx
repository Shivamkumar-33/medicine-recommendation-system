import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { calculateSafetyStats, MedicineSafety } from "@/utils/safetyChecker";

interface SafetyChartProps {
  safetyResults: MedicineSafety[];
}

export const SafetyChart = ({ safetyResults }: SafetyChartProps) => {
  const stats = calculateSafetyStats(safetyResults);
  
  const data = [
    { name: "Safe Medicines", value: stats.safe, color: "hsl(var(--success))" },
    { name: "Unsafe Medicines", value: stats.unsafe, color: "hsl(var(--destructive))" },
  ];

  return (
    <Card className="border-2 shadow-lg hover-lift animate-scale-in">
      <CardHeader className="bg-accent">
        <CardTitle className="flex items-center gap-2">
          📊 Safety Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 animate-fade-in-scale">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div className="p-4 bg-muted rounded-lg hover-lift transition-smooth animate-slide-in-up stagger-1">
            <p className="text-2xl font-bold text-foreground animate-bounce-in">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Medicines</p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success hover-lift hover-glow transition-smooth animate-slide-in-up stagger-2 animate-pulse-glow-success">
            <p className="text-2xl font-bold text-success animate-bounce-in">{stats.safe}</p>
            <p className="text-sm text-success">Safe</p>
          </div>
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive hover-lift transition-smooth animate-slide-in-up stagger-3">
            <p className="text-2xl font-bold text-destructive animate-bounce-in">{stats.unsafe}</p>
            <p className="text-sm text-destructive">Unsafe</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
