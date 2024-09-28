import { useContext, useState, FormEvent } from "react"
import { AppContext } from "../../contexts/AppContext"
import { useNavigate } from "react-router-dom"

interface FormData {
  login: string
  password: string
}

interface Errors {
  login?: string[]
  password?: string[]
}

export default function Login() {
  const { setToken } = useContext(AppContext)!
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    login: "",
    password: "",
  })

  const [errors, setError] = useState<Errors>({})

  async function handleLogin(e: FormEvent) {
    e.preventDefault()

    const result = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    const data = await result.json()

    console.log(data)

    if (data.errors) {
      setError(data.errors)
    } else {
      localStorage.setItem("token", data.token)
      setToken(data.token)
      navigate("/")
    }
  }

  return (
    <>
      <h1 className="title">Login to your account</h1>

      <form onSubmit={handleLogin} className="w-1/2 mx-auto space-y-6">
        <div>
          <input
            type="text"
            placeholder="Email/Username"
            value={formData.login}
            onChange={(e) =>
              setFormData({ ...formData, login: e.target.value })
            }
          />
          {errors.login && <p className="error">{errors.login[0]}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          {errors.password && <p className="error">{errors.password[0]}</p>}
        </div>

        <button className="primary-btn">Login</button>
      </form>
    </>
  )
}
