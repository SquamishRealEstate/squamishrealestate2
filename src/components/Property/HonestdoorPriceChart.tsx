import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOption } from "@/lib/chartOption";
// Assuming you are importing Line and ChartOption from your chart library setup

ChartJS.register(
  CategoryScale,
  LinearScale, // <--- This fixes the "linear" error
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const HonestDoorPriceChart = ({ priceHistory }: { priceHistory: any[] }) => {
  // Safety check: if no data is passed, don't render the chart
  if (
    !priceHistory ||
    !Array.isArray(priceHistory) ||
    priceHistory.length === 0
  ) {
    return null;
  }

  // 1. Generate labels directly from the provided dates
  const labels = priceHistory.map((item) => {
    // Safely parse the "YYYY-MM-DD" string
    // Adding "T00:00:00" prevents timezone shifting bugs
    const dateObj = new Date(`${item.date}T00:00:00`);

    // Formats to something like "Jan 25" or "Aug 26"
    return dateObj.toLocaleDateString("default", {
      month: "short",
      year: "2-digit",
    });
  });

  // 2. Extract the prices for the graph (using item.price, not item.Value)
  const data = {
    labels,
    datasets: [
      {
        label: "HonestDoor Price",
        data: priceHistory.map((item) => item.price),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="p-4">
      <Line data={data} options={ChartOption} />
    </div>
  );
};

export default HonestDoorPriceChart;
