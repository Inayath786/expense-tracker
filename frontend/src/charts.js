import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// register components and plugins
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ChartDataLabels);

function Charts({ expenses }) {
  // Sum up expenses by category
  let requiredSum = 0;
  let notRequiredSum = 0;

  expenses.forEach(exp => {
    if (exp.category === "Required") {
      requiredSum += exp.amount;
    } else if (exp.category === "Not Required") {
      notRequiredSum += exp.amount;
    }
  });

  const pieData = {
    labels: ["Required", "Not Required"],
    datasets: [
      {
        data: [requiredSum, notRequiredSum],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#333",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Spending by Category",
        font: {
          size: 18,
        },
        color: "#333",
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => `₹${value}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ₹${value}`;
          },
        },
      },
    },
  };

  // Group expenses by month
  const monthlySums = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthYear = date.toLocaleString("default", { month: "short", year: "numeric" });

    monthlySums[monthYear] = (monthlySums[monthYear] || 0) + exp.amount;
  });

  const barData = {
    labels: Object.keys(monthlySums),
    datasets: [
      {
        label: "Total Expenses (₹)",
        data: Object.values(monthlySums),
        backgroundColor: "#2196F3",
      },
    ],
  };

  const barOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Expenses Over Time",
        color: "#333",
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#333",
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Expenses (₹)",
          color: "#333",
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="charts-container">
      <div style={{ width: "300px", marginBottom: "30px" }}>
        <Pie data={pieData} options={pieOptions} />
      </div>
      <div style={{ width: "600px" }}>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}

export default Charts;
