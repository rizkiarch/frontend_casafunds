import React, { useEffect, useState } from "react"
import { EyeIcon } from "../components/EyeIcon"
import { EditIcon } from "../components/EditIcon"
import { DeleteIcon } from "../components/DeleteIcon"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spinner,
} from "@nextui-org/react"
import axios from "axios"

type CategoryType = {
  id: number
  name: string
}
const fetcher = (url) => axios.get(url).then((res) => res.data)

export default function Categories() {
  const [page, setPage] = React.useState(1)
  const { data, isLoading } = await axios.get(
    `/api/categories?page=${page}`,
    fetcher,
    { keepPreviousData: true }
  )

  const rowsPerPage = 10

  const pages = React.useMemo(() => {
    return data?.count ? Math.ceil(data.count / rowsPerPage) : 0
  }, [data?.count, rowsPerPage])

  const [categories, setCategories] = useState<CategoryType[]>([])
  const [error, setError] = useState<string | null>(null)
  // const [loading, setLoading] = useState<boolean>(false)
  const loadingState =
    isLoading || data?.results.length === 0 ? "loading" : "idle"

  // async function getCategories() {
  //   setLoading(true)
  //   try {
  //     const { data, isLoading } = await axios.get(
  //       `/api/categories?page=${page}`,
  //       fetcher
  //     )

  //     // const response = await fetch("/api/categories")
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch categories")
  //     }
  //     // const data = await response.json()

  //     console.log(data.categories)
  //     setCategories(data.categories)
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       setError(err.message)
  //     } else {
  //       setError("Something went wrong")
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // useEffect(() => {
  //   getCategories()
  // }, [])

  const columns = [
    {
      key: "number",
      label: "#",
    },
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "actions",
      label: "ACTION",
    },
  ]

  const renderCell = (
    item: CategoryType,
    columnKey: keyof CategoryType | "number" | "actions",
    index?: number
  ) => {
    switch (columnKey) {
      case "number":
        return (index ?? 0) + 1
      case "name":
        return item.name
      case "actions":
        return (
          <div className="relative flex items-end gap-2">
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  // if (loading) {
  //   return <div>Loading categories...</div>
  // }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Table isStriped aria-label="Example table with custom cells">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={categories} emptyContent={"No rows to display."}>
        {(item: Category) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>
                {renderCell(item, columnKey as keyof Category)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
