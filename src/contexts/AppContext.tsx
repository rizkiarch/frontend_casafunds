import { createContext, useEffect, useState, ReactNode } from "react"

interface AppContextType {
  token: string | null
  setToken: (token: string | null) => void
  user: UserType | null
  setUser: (user: UserType | null) => void
}

interface UserType {
  id: number
  name: string
  email: string
}

interface AppProviderProps {
  children: ReactNode
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export default function AppProvider({ children }: AppProviderProps) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )
  const [user, setUser] = useState<UserType | null>(null)

  async function getUser() {
    try {
      const result = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!result.ok) {
        throw new Error("Failed to fetch user")
      }

      const data = await result.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  useEffect(() => {
    if (token) {
      getUser()
    }
  }, [token])

  return (
    <AppContext.Provider value={{ token, setToken, user, setUser }}>
      {children}
    </AppContext.Provider>
  )
}
