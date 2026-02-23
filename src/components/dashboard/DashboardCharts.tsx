import { useMemo } from "react";
import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CampaignSummary } from "@/types";
import type { PieLabelRenderProps } from "recharts";

// Colors for charts
const CHART_COLORS = {
  primary: "#E9488A",
  secondary: "#F3B44C",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
};

const PIE_COLORS = [
  CHART_COLORS.success,
  CHART_COLORS.info,
  CHART_COLORS.secondary,
  CHART_COLORS.danger,
];

interface PieChartData {
  name: string;
  value: number;
}

interface BarChartData {
  name: string;
  contacts: number;
}

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface DashboardChartsProps {
  data?: CampaignSummary;
  isLoading?: boolean;
}


/**
 * Enhanced Dashboard Charts Component
 * Displays various analytics charts for campaign performance
 */
export default function DashboardCharts({ data, isLoading }: DashboardChartsProps) {
  // Pie chart data - Delivery Breakdown
  const pieChartData = useMemo<PieChartData[]>(() => {
    if (!data) return [];
    
    return [
      {
        name: "Delivered",
        value: data.deliveries?.delivered || 0,
      },
      {
        name: "Opened",
        value: data.deliveries?.opened || 0,
      },
      {
        name: "Clicked",
        value: data.deliveries?.clicked || 0,
      },
      {
        name: "Failed",
        value: data.deliveries?.failed || 0,
      },
    ].filter(item => item.value > 0);
  }, [data]);

  // Bar chart data - Email vs WhatsApp
  const barChartData = useMemo<BarChartData[]>(() => {
    if (!data) return [];
    
    return [
      {
        name: "Email",
        contacts: data.contacts?.email || 0,
      },
      {
        name: "WhatsApp",
        contacts: data.contacts?.whatsapp || 0,
      },
    ];
  }, [data]);

  // Funnel chart data
  const funnelData = useMemo<FunnelData[]>(() => {
    if (!data) return [];
    
    const sent = data.deliveries?.sent || 0;
    const delivered = data.deliveries?.delivered || 0;
    const opened = data.deliveries?.opened || 0;
    const clicked = data.deliveries?.clicked || 0;
    
    return [
      { name: "Sent", value: sent, fill: CHART_COLORS.primary },
      { name: "Delivered", value: delivered, fill: CHART_COLORS.info },
      { name: "Opened", value: opened, fill: CHART_COLORS.success },
      { name: "Clicked", value: clicked, fill: CHART_COLORS.secondary },
    ];
  }, [data]);

  // Custom label for pie chart
  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          // @ts-ignore - Ant Design Card type compatibility
          <Card key={i} loading className="rounded-2xl shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engagement Summary Card */}
      {/* @ts-expect-error - Ant Design Card type compatibility with React types */}
      <Card
        className="rounded-2xl shadow-sm border border-gray-200"
        title={
          <h3 className="text-lg font-semibold text-gray-900 m-0">
            Engagement Summary
          </h3>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">Open Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {data?.rates?.openRate?.toFixed(2) || 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">Click Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {data?.rates?.clickRate?.toFixed(2) || 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">CTR</p>
            <p className="text-2xl font-bold text-purple-600">
              {data?.rates?.clickThroughRate?.toFixed(2) || 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">Failure Rate</p>
            <p className="text-2xl font-bold text-red-600">
              {data?.rates?.failureRate?.toFixed(2) || 0}%
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Delivery Breakdown */}
        {/* @ts-expect-error - Ant Design Card type compatibility */}
        <Card
          className="rounded-2xl shadow-sm border border-gray-200"
          title={
            <h3 className="text-lg font-semibold text-gray-900 m-0">
              Delivery Breakdown
            </h3>
          }
        >
          {/* @ts-expect-error - Recharts ResponsiveContainer type compatibility */}
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-expect-error - Recharts PieChart type compatibility */}
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  // @ts-expect-error - Recharts Cell type compatibility
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              {/* @ts-expect-error - Recharts Legend type compatibility */}
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "#374151", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart - Email vs WhatsApp */}
        {/* @ts-expect-error - Ant Design Card type compatibility */}
        <Card
          className="rounded-2xl shadow-sm border border-gray-200"
          title={
            <h3 className="text-lg font-semibold text-gray-900 m-0">
              Contact Distribution
            </h3>
          }
        >
          {/* @ts-expect-error - Recharts ResponsiveContainer type compatibility */}
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-expect-error - Recharts BarChart type compatibility */}
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {/* @ts-expect-error - Recharts XAxis type compatibility */}
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: "#6b7280" }}
              />
              {/* @ts-expect-error - Recharts YAxis type compatibility */}
              <YAxis stroke="#6b7280" fontSize={12} tick={{ fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              {/* @ts-expect-error - Recharts Bar type compatibility */}
              <Bar
                dataKey="contacts"
                fill={CHART_COLORS.primary}
                radius={[8, 8, 0, 0]}
                name="Contacts"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Funnel Chart - Sent → Delivered → Opened → Clicked */}
        {/* @ts-expect-error - Ant Design Card type compatibility */}
        <Card
          className="rounded-2xl shadow-sm border border-gray-200"
          title={
            <h3 className="text-lg font-semibold text-gray-900 m-0">
              Engagement Funnel
            </h3>
          }
        >
          {/* @ts-expect-error - Recharts ResponsiveContainer type compatibility */}
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-expect-error - Recharts BarChart type compatibility */}
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {/* @ts-expect-error - Recharts XAxis type compatibility */}
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              {/* @ts-expect-error - Recharts YAxis type compatibility */}
              <YAxis
                dataKey="name"
                type="category"
                stroke="#6b7280"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              {/* @ts-expect-error - Recharts Bar type compatibility */}
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                name="Count"
              >
                {funnelData.map((entry, index) => (
                  // @ts-expect-error - Recharts Cell type compatibility
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
