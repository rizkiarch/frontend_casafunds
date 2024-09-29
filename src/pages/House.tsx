import {
  Button,
  Chip,
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
  Tooltip,
} from "@nextui-org/react"
import React, { useEffect, useState } from "react"
import { EditIcon } from "../components/EditIcon"
import { SearchIcon } from "../components/SearchIcon"
import { PlusIcon } from "../components/PlusIcon"

type HouseType = {
  id: number
  user: User
  address: string
  status: string
}

interface FormData {
  user_id: number
  address: string
  status: string
}

interface Errors {
  full_name: string
  address: string
  status: string
}

interface User {
  id: number
  full_name: string
}

export default function House() {
  const [houses, setHouses] = useState<HouseType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "full_name",
    direction: "ascending",
  })
  const hasSearchFilter = Boolean(filterValue)

  useEffect(() => {
    const getHouses = async () => {
      const response = await fetch("/api/houses")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setHouses(data.houses)
      }
    }

    getHouses()
  }, [])

  const columns = [
    {
      key: "user_id",
      header: "Name Penghuni",
    },
    {
      key: "address",
      header: "Address",
    },
    {
      key: "status",
      header: "Status",
    },
    {
      key: "actions",
      header: "Actions",
    },
  ]

  const renderCell = (house: HouseType, columnKey: React.Key) => {
    const cellValue = house[columnKey as keyof HouseType]

    switch (columnKey) {
      case "user_id":
        return house.user ? (
          <span>{house.user.full_name}</span>
        ) : (
          <span>Unknown User</span>
        )
      case "address":
        return <span>{String(cellValue)}</span>
      case "status":
        return (
          <>
            {cellValue === "Dihuni" ? (
              <Chip
                className="capitalize"
                size="sm"
                variant="flat"
                color="success"
              >
                {String(cellValue)}
              </Chip>
            ) : (
              <Chip
                className="capitalize"
                size="sm"
                variant="flat"
                color="warning"
              >
                {String(cellValue)}
              </Chip>
            )}
          </>
        )

      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit user">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                //   onClick={() => handleEditOpen(penghuni)}
              >
                <EditIcon />
              </span>
            </Tooltip>
          </div>
        )
    }
  }

  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? houses.filter((house) => {
          const searchValue = filterValue.toLocaleLowerCase()
          return (
            house.address.toLocaleLowerCase().includes(searchValue) ||
            house.user?.full_name.toLocaleLowerCase().includes(searchValue) ||
            false
          )
        })
      : houses

    //       house.address
    //         .toLocaleLowerCase()
    //         .includes(filterValue.toLocaleLowerCase())
    //     )
    //   : houses
  }, [houses, filterValue, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return Array.isArray(filteredItems) ? filteredItems.slice(start, end) : []
  }, [filteredItems, rowsPerPage, page])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof HouseType] as number
      const second = b[sortDescriptor.column as keyof HouseType] as number
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
        <div className="flex gap-3">
          <Button
            color="primary"
            variant="flat"
            endContent={<PlusIcon />}
            // onPress={() => onOpen()}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {houses.length} categories
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
  )
}
