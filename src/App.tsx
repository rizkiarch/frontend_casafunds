import { useContext } from "react"
import { AppContext } from "./contexts/AppContext"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./pages/Layout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Categories from "./pages/Categories"
import Penghuni from "./pages/Penghuni"
import House from "./pages/House"
import Payement from "./pages/Payement"

function App() {
  const { user } = useContext(AppContext)!
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="/register"
            element={user ? <Dashboard /> : <Register />}
          />
          <Route path="/login" element={user ? <Dashboard /> : <Login />} />

          <Route path="/penghuni" element={user ? <Penghuni /> : <Login />} />
          <Route path="/rumah" element={user ? <House /> : <Login />} />
          <Route path="/pembayaran" element={user ? <Payement /> : <Login />} />
          <Route
            path="/categories"
            element={user ? <Categories /> : <Login />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
