import axios from "axios"
import React, { useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
} from "@nextui-org/react"

type CategoryType = {
  id: number
  name: string
}

export default function TableCategories() {
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)

  //   const [rowsPerPage, setRowsPerPage] = React.useState(5)

  async function getCategories() {
    const response = await fetch("/api/categories")
    const data = await response.json()
    setIsLoading(false)

    console.log(data.categories)
    if (response.ok) {
      setCategories(data.categories)
    }
  }

  useEffect(() => {
    getCategories()
  }, [])

  let list = useAsyncList<CategoryType>({
    async load({ signal, cursor }) {
      if (cursor) {
        setPage((prev) => prev + 1)
      }

      const res = await fetch(
        cursor || "https://swapi.py4e.com/api/people/?search=",
        { signal }
      )
      let json = await res.json()

      if (!cursor) {
        setIsLoading(false)
      }

      return {
        items: json.results,
        cursor: json.next,
      }
    },
  })

  //   const getCategories = async () => {
  //     try {
  //       const response = await axios.get(`api/categories`)
  //       setCategories(response.data?.data)

  //       console.log(response.data)
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }

  //   useEffect(() => {
  //     getCategories()
  //   }, [])

  const columns = [
    {
      key: "no",
      label: "#",
    },
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ]

  const hasMore = page < 9

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Example table with client side sorting"
        bottomContent={
          hasMore && !isLoading ? (
            <div className="flex w-full justify-center">
              <Button
                isDisabled={list.isLoading}
                variant="flat"
                onPress={list.loadMore}
              >
                {list.isLoading && <Spinner color="white" size="sm" />}
                Load More
              </Button>
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[420px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={"No rows to display."}
          items={categories}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
