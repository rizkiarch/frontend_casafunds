import {
  Button,
  Input,
  Pagination,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"
import { SearchIcon } from "../components/SearchIcon"
import React, { useEffect, useState } from "react"

type History_HouseType = {
  id: number
  house_id: number
  user_id: number

  user: User
  house: House

  start_date: string
  end_date: string
}

interface User {
  id: number
  full_name: string
}

interface House {
  id: number
  address: string
}

interface Errors {
  full_name: string
  address: string
  start_date: string
  end_date: string
}
export default function Histories() {
  const [histories, setHistories] = useState<History_HouseType[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [isLoading, setIsLoading] = useState(true)

  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "full_name",
    direction: "ascending",
  })

  const hasSearchFilter = Boolean(filterValue)
  // get all histories
  useEffect(() => {
    const getHistories = async () => {
      const response = await fetch("/api/house-histories")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setHistories(data.houseHistories)
      }
    }

    getHistories()
  }, [])

  // coloumn table
  const columns = [
    {
      key: "user_id",
      header: "Nama Penghuni",
    },
    {
      key: "house_id",
      header: "Alamat Rumah",
    },
    {
      key: "start_date",
      header: "Tanggal Masuk",
    },
    {
      key: "end_date",
      header: "Tanggal Keluar",
    },
  ]

  const renderCell = (history: History_HouseType, columnKey: React.Key) => {
    const cellValue = history[columnKey as keyof History_HouseType]

    const formatDate = (date: string | Date) => {
      if (!date) return "Tanggal Tidak Tersedia"
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date))
      return formattedDate
    }

    switch (columnKey) {
      case "user_id":
        return history.user ? (
          <span>{history.user.full_name}</span>
        ) : (
          <span>Unknown User</span>
        )
      case "house_id":
        return history.house ? (
          <span>{history.house.address}</span>
        ) : (
          <span>Unknown House</span>
        )
      case "start_date":
        return cellValue ? (
          <span>{formatDate(cellValue as string)}</span>
        ) : (
          <span>Tanggal Tidak Tersedia</span>
        )
      case "end_date":
        return cellValue ? (
          <span>{formatDate(cellValue as string)}</span>
        ) : (
          <span>Belum Ada Tanggal</span>
        )
      default:
        return <span>Unknown</span>
    }
  }

  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? histories.filter((history) => {
          const searchValue = filterValue.toLowerCase()
          return (
            history.user?.full_name.toLocaleLowerCase().includes(searchValue) ||
            "" ||
            history.house?.address.toLocaleLowerCase().includes(searchValue) ||
            "" ||
            false
          )
        })
      : histories
  }, [histories, filterValue, hasSearchFilter])

  const pages = Math.ceil((filteredItems?.length || 0) / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return Array.isArray(filteredItems) ? filteredItems.slice(start, end) : []
  }, [filteredItems, page, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[
        sortDescriptor.column as keyof History_HouseType
      ] as number
      const second = b[
        sortDescriptor.column as keyof History_HouseType
      ] as number
      return sortDescriptor.direction === "ascending"
        ? first - second
        : second - first
    })
  }, [items, sortDescriptor])

  const onRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value))
    setPage(1)
  }

  const onSearchChange = (value?: string) => {
    setFilterValue(value || "")
    setPage(1)
  }

  const onClear = () => {
    setFilterValue("")
    setPage(1)
  }

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by name/address..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        {/* <div className="flex gap-3">
            <Button
              color="primary"
              variant="flat"
              endContent={<PlusIcon />}
              onPress={() => onOpen()}
            >
              Add New
            </Button>
          </div> */}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {histories.length} categories
        </span>
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  )

  const onNextPage = () => {
    if (page < pages) {
      setPage(page + 1)
    }
  }
  const onPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const bottomContent = (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="w-[30%] text-small text-default-400"></span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
      <div className="hidden xs:flex w-[30%] justify-end gap-2">
        <Button
          isDisabled={pages === 1}
          size="sm"
          variant="flat"
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={pages === 1}
          size="sm"
          variant="flat"
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  )
  return (
    <div>
      <h1>histories</h1>
      <Table
        aria-label="Example table with client side sorting"
        isHeaderSticky
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: "max-h-[382px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.header}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={"No rows to display."}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
