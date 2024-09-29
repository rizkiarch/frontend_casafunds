import { FormEvent, useContext, useState } from "react"
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
  full_name: string
  username: string
  email: string
  password: string
  password_confirmation: string
}

interface Errors {
  full_name?: string[]
  username?: string[]
  email?: string[]
  password?: string[]
  password_confirmation?: string[]
}

export default function Register() {
  const { setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const [errors, setError] = useState<Errors>({})

  async function handleRegister(e: FormEvent) {
    e.preventDefault()

    const result = await fetch("/api/register", {
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
        <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-6">
          <CardBody className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <div>
              <Input
                type="text"
                label="Full Name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              {errors.full_name && (
                <p className="error">{errors.full_name[0]}</p>
              )}
            </div>
            <div>
              <Input
                type="text"
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              {errors.username && <p className="error">{errors.username[0]}</p>}
            </div>
            <div>
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && <p className="error">{errors.email[0]}</p>}
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {errors.password && <p className="error">{errors.password[0]}</p>}
            </div>
            <div>
              <Input
                label="Password Confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
              />{" "}
              {errors.password_confirmation && (
                <p className="error">{errors.password_confirmation[0]}</p>
              )}
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
