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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { label: "Dashboard", path: "/" },
    { label: "Penghuni", path: "/penghuni" },
    { label: "Rumah", path: "/rumah" },
    { label: "Pembayaran", path: "/pembayaran" },
    { label: "Pengeluaran", path: "/pengeluaran" },
    { label: "Categori", path: "/categories" },
    { label: "Account", path: "/account" },
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
      >
        <NavbarContent className="lg:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>

        <NavbarContent className="hidden pr-3" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit">CASAFUNDS</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className=" sm:flex gap-4" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit">CASAFUNDS</p>
          </NavbarBrand>

          {menuItems.map((item, index) => (
            <NavbarItem key={index} isActive={location.pathname === item.path}>
              <Link color="foreground" to={item.path}>
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {user ? (
          <NavbarContent justify="end">
            <NavbarItem>
              <form onSubmit={handleLogout}>
                <button color="warning" className="btn btn-sm">
                  Log Out
                </button>
              </form>
            </NavbarItem>
          </NavbarContent>
        ) : (
          <NavbarContent justify="end">
            <NavbarItem className="hidden lg:flex">
              <Link href="#">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="warning" href="#" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </NavbarContent>
        )}

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

      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <Outlet />
      </main>
    </>
  )
}

{
  /* <nav>
          <Link to="/" className="nav-link">
            Home
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <p className="text-slate-400 text-xs">Welcome back {user.name}</p>
              <Link to="/create" className="nav-link">
                New Post
              </Link>
              <form onSubmit={handleLogout}>
                <button className="nav-link">Logout</button>
              </form>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/register" className="nav-link">
                Register
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </div>
          )}
        </nav> */
}
