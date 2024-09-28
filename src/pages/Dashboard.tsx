import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Registering necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  // State untuk menyimpan data chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })

  const [loading, setLoading] = useState(true) // Optional: untuk menandai proses loading data

  // Fungsi untuk mengambil data bar chart dari API
  async function fetchBarChartData() {
    try {
      const result = await fetch("/api/bar-chart")
      const responseData = await result.json()

      console.log(responseData)

      if (result.ok && responseData.result === "ok") {
        const { labels, datasets } = responseData.data

        // Mengupdate state chartData dengan data dari API
        setChartData({
          labels, // Label untuk sumbu X
          datasets: datasets.map((dataset: any) => ({
            label: dataset.label,
            backgroundColor: dataset.backgroundColor,
            data: dataset.data.map((d: string) => parseFloat(d)), // Konversi data string menjadi angka
          })),
        })
      }
    } catch (error) {
      console.error("Error fetching bar chart data:", error)
    } finally {
      setLoading(false) // Selesai loading
    }
  }

  useEffect(() => {
    fetchBarChartData()
  }, [])

  // Opsi konfigurasi chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Payments and Spendings",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Memastikan sumbu y mulai dari 0
      },
    },
  }

  if (loading) return <p>Loading chart...</p> // Tampilan loading saat data masih diambil

  return (
    <div>
      <h2>Dashboard</h2>
      <Bar data={chartData} options={options} />
    </div>
  )
}
