import { useContext, useState, FormEvent } from "react"
import { AppContext } from "../../contexts/AppContext"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react"

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
      <Card
        isBlurred
        className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px]"
        shadow="sm"
      >
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Welcome Back!</h1>
            <p className="text-md">
              Login <b>CasaFunds</b>{" "}
            </p>
          </div>
        </CardHeader>
        <Divider />
        <form onSubmit={handleLogin} className="w-1/2 mx-auto space-y-6">
          <CardBody className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <div>
              <Input
                type="text"
                label="Email/Username"
                value={formData.login}
                onChange={(e) =>
                  setFormData({ ...formData, login: e.target.value })
                }
              />
              {errors.login && <p className="error">{errors.login[0]}</p>}
            </div>
            <div>
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />{" "}
              {errors.password && <p className="error">{errors.password[0]}</p>}
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button color="primary" className="primary-btn" type="submit">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
