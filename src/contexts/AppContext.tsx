import { createContext, useEffect, useState, ReactNode } from "react"

// interface AppContextType {
//   token: string | null
//   setToken: (token: string | null) => void
//   user: UserType | null
//   setUser: (user: UserType | null) => void
// }

// interface UserType {
//   id: number
//   name: string
//   email: string
// }

export const AppContext = createContext<{
  token: string | null
  setToken: React.Dispatch<React.SetStateAction<string | null>>
  user: UserType | null
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>
} | null>(null)

interface AppProviderProps {
  children: ReactNode
}

// export const AppContext = createContext<AppContextType | undefined>(undefined)

export default function AppProvider({ children }: AppProviderProps) {
  // const [token, setToken] = useState<string | null>(
  //   localStorage.getItem("token")
  // )
  // const [user, setUser] = useState<UserType | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )
  const [user, setUser] = useState<UserType | null>(null)

  async function getUser() {
    const result = await fetch("api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await result.json()

    if (result.ok) {
      setUser(data)
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
