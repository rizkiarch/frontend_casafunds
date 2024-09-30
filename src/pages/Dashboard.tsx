import React, { useEffect, useState } from "react"
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

import Histories from "./Histories"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  // start chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })
  const [isLoading, setLoading] = useState(true)
  async function fetchBarChartData() {
    try {
      const result = await fetch("/api/bar-chart")
      const responseData = await result.json()

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
  if (isLoading) return <span>Loading</span>
  // end chart

  return (
    <>
      <div>
        <h2 style={{ textAlign: "center" }}>
          {" "}
          <b>Total Pengeluaran Selama 1 Tahun</b>
        </h2>
        <Bar data={chartData} options={options} />
      </div>
      <div>
        <Histories />
      </div>
    </>
  )
}
