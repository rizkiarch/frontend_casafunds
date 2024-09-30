import { FormEvent, useContext, useState } from "react"
import { AppContext } from "../contexts/AppContext"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react"

export default function Layout() {
  const { user, setUser, token, setToken } = useContext(AppContext)!
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { label: "Dashboard", path: "/" },
    { label: "Penghuni", path: "/penghuni" },
    { label: "Rumah", path: "/rumah" },
    { label: "Pembayaran", path: "/pembayaran" },
    { label: "Pengeluaran", path: "/pengeluaran" },
    { label: "Categori", path: "/categories" },
  ]

  async function handleLogout(e: FormEvent) {
    e.preventDefault()

    const result = await fetch("/api/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await result.json()
    console.log(data)

    if (result.ok) {
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      navigate("/login")
    }
  }

  return (
    <>
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="px-4 md:px-6 lg:px-8"
      >
        {user ? (
          <>
            {/* Toggle Menu for Mobile */}
            <NavbarContent className="lg:hidden" justify="start">
              <NavbarMenuToggle
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              />
            </NavbarContent>

            {/* Brand, di kiri untuk semua ukuran layar */}
            <NavbarContent justify="start">
              <NavbarBrand>
                <p className="font-bold text-inherit">CASAFUNDS</p>
              </NavbarBrand>
            </NavbarContent>

            {/* Menu Items pada layar desktop */}
            <NavbarContent className="hidden lg:flex gap-4" justify="center">
              {menuItems.map((item, index) => (
                <NavbarItem
                  key={index}
                  isActive={location.pathname === item.path}
                >
                  <Link className="text-lg" to={item.path}>
                    {item.label}
                  </Link>
                </NavbarItem>
              ))}
            </NavbarContent>

            {/* Logout Button */}
            <NavbarContent justify="end">
              <NavbarItem>
                <form onSubmit={handleLogout}>
                  <Button
                    color="warning"
                    className="btn btn-sm lg:btn-md"
                    type="submit"
                  >
                    Log Out
                  </Button>
                </form>
              </NavbarItem>
            </NavbarContent>
          </>
        ) : (
          <NavbarContent justify="end">
            <NavbarItem>
              <Link to="/login" className="text-lg">
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="warning" to="/register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </NavbarContent>
        )}

        {/* Mobile Menu */}
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarItem key={index} isActive={location.pathname === item.path}>
              <Link color="foreground" to={item.path}>
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarMenu>
      </Navbar>

      <main className="max-w-screen-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
    </>
  )
}
