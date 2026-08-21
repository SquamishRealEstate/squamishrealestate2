export const ChartOption = {
  responsive: true,
  maintainAspectRatio: false, // Allows you to control height via CSS/Tailwind
  plugins: {
    legend: {
      display: false, // Hides the legend label at the top
    },
    tooltip: {
      callbacks: {
        // Formats the tooltip hover value as Currency
        label: function (context: any) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    y: {
      ticks: {
        // Formats the Y-axis labels as currency (e.g., $1.5M or $1,500,000)
        callback: function (value: any) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(value);
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)", // Light grid lines
      },
    },
    x: {
      grid: {
        display: false, // Hides vertical grid lines for a cleaner look
      },
    },
  },
};
