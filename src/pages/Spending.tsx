import {
  Autocomplete,
  AutocompleteItem,
  Button,
  DatePicker,
  input,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  useDisclosure,
} from "@nextui-org/react"
import {
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table"
import { p, pre, use } from "framer-motion/client"
import React, { FormEvent, useContext, useEffect, useState } from "react"
import { SearchIcon } from "../components/SearchIcon"
import { PlusIcon } from "../components/PlusIcon"
import { AppContext } from "../contexts/AppContext"
import { getLocalTimeZone, today } from "@internationalized/date"
import { format } from "date-fns"

type SpendingType = {
  id: number
  spending_date: string
  category_id: number
  category: Category
  amount: number
  description: string
}

interface Category {
  id: number
  name: string
}

interface FormData {
  spending_date: string
  category_id: number
  amount: number
  description: string
}

interface Errors {
  spending_date?: string
  category_id?: string
  amount?: string
  description?: string
}

export default function Spending() {
  const [spendings, setSpendings] = useState<SpendingType[]>([])
  const [selectCategory, setSelectCategory] = useState<Category[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [filterValue, setFilterValue] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  })

  const hasSearchFilter = Boolean(filterValue)

  //   get spending
  useEffect(() => {
    const getSpending = async () => {
      const response = await fetch("/api/spendings")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setSpendings(data.spendings)
      }
    }

    getSpending()
  }, [])

  //   get categories
  useEffect(() => {
    const getCategory = async () => {
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (response.ok) {
        setSelectCategory(data.categories)
      }
    }

    getCategory()
  }, [])

  //   columns
  const columns = [
    {
      key: "category_id",
      header: "Category",
    },
    {
      key: "spending_date",
      header: "Date",
    },
    {
      key: "amount",
      header: "Amount",
    },
    {
      key: "description",
      header: "Description",
    },
    // {
    //   key: "action",
    //   header: "Action",
    // },
  ]

  const renderCell = (
    spending: SpendingType,
    coloumnKey: string
  ): React.ReactNode => {
    const cellValue = spending[
      coloumnKey as keyof SpendingType
    ] as React.ReactNode

    const formatDate = (date: string | Date) => {
      if (!date) return "Tanggal Tidak Tersedia"
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date))
      return formattedDate
    }

    const formatCurrency = (value) => {
      if (value === null || value === undefined) return "Tidak Tersedia"
      const numberValue = parseFloat(value)
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(numberValue)
    }

    switch (coloumnKey) {
      case "category_id":
        return spending.category ? (
          <span>{spending.category.name}</span>
        ) : (
          <span>Kategori Tidak Tersedia</span>
        )
      case "spending_date":
        return cellValue ? (
          <span>{formatDate(cellValue as string)}</span>
        ) : (
          <span>Tanggal Tidak Tersedia</span>
        )
      case "amount":
        return formatCurrency(cellValue)
      case "description":
        return cellValue
      //   case "action":
      //     return (
      //       <>
      //         {/* <button onClick={() => handleEdit(spending)}>Edit</button>
      //             <button onClick={() => handleDelete(spending)}>Delete</button> */}
      //       </>
      //     )
      default:
        return cellValue
    }
  }

  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? spendings.filter((spendings) => {
          const searchValue = filterValue.toLowerCase()
          return (
            spendings.category?.name.toLowerCase().includes(searchValue) ||
            "" ||
            false
          )
        })
      : spendings
  }, [spendings, filterValue, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = page * rowsPerPage
    return Array.isArray(filteredItems) ? filteredItems.slice(start, end) : []
  }, [filteredItems, rowsPerPage, page])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof SpendingType] as number
      const second = b[sortDescriptor.column as keyof SpendingType] as number
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
          placeholder="Search by name"
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
            onPress={() => onOpen()}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {spendings.length} Catatan Pengeluaran
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  const backdrop = "blur"
  const token = useContext(AppContext)
  const [formData, setFormData] = useState<FormData>({
    spending_date: "",
    category_id: null,
    amount: 0,
    description: "",
  })

  const [errors, setErrors] = useState<Errors>({})

  async function handleCreate(e: FormEvent) {
    e.preventDefault()

    const response = await fetch("/api/spendings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.errors) {
      setErrors(data.errors)
      alert(data.error)
    } else {
      alert(data.message)
      const reloadResponse = await fetch("/api/spendings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const reloadData = await reloadResponse.json()
      if (reloadData.error) {
        alert(reloadData.error)
      } else {
        setSpendings(reloadData.spendings)
        setFormData({})
        onClose()
      }
    }
  }

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

  const [fieldStateCreate, setFieldStateCreate] = useState({
    selectedKey: formData.category_id,
    inputValue: "",
    items: selectCategory,
  })

  const onSelectionChangeCreate = (key: React.Key | null) => {
    if (key === null) return
    const selectedCategory = selectCategory.find(
      (category) => category.id === Number(key)
    )

    setFormData((prev) => ({
      ...prev,
      category_id: selectedCategory ? selectedCategory.id : 0,
    }))

    setFieldStateCreate((prevState) => ({
      ...prevState,
      inputValue: selectedCategory ? selectedCategory.name : "",
      selectedKey: selectedCategory ? selectedCategory.id : 0,
    }))
  }

  const onInputChangeCreate = (value: string) => {
    setFieldStateCreate((prevState) => {
      const filteredItems = Array.isArray(selectCategory)
        ? selectCategory.filter((category) =>
            category.name.toLowerCase().includes(value.toLowerCase())
          )
        : []

      return {
        ...prevState,
        inputValue: value,
        selectedKey: value ? 0 : prevState.selectedKey,
        items: filteredItems,
      }
    })
  }

  return (
    <>
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
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Catatan Pengeluaran
              </ModalHeader>
              <form onSubmit={handleCreate}>
                <ModalBody>
                  <Autocomplete
                    variant="bordered"
                    label="Select Categori"
                    className="mb-4"
                    inputValue={fieldStateCreate.inputValue}
                    items={fieldStateCreate.items}
                    selectedKey={fieldStateCreate.selectedKey}
                    onInputChange={onInputChangeCreate}
                    onSelectionChange={onSelectionChangeCreate}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.id}>
                        {item.name}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <DatePicker
                    isRequired
                    className="bordered"
                    label="Tanggal Pembayaran"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).subtract({
                      days: 1,
                    })}
                    onChange={(date) => {
                      const formatStartDate = format(date, "yyyy-MM-dd")

                      setFormData((prev) => ({
                        ...prev,
                        spending_date: formatStartDate, // Simpan nilai tanggal Pembayaran di formData
                      }))
                    }}
                  />

                  <Input
                    type="number"
                    label="Jumlah Pengeluaran"
                    id="amount"
                    variant="bordered"
                    value={(formData.amount || 0).toString()} // Menggunakan 0 sebagai nilai default
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">Rp</span>
                      </div>
                    }
                  />

                  <Input
                    type="text"
                    label="Description"
                    id="description"
                    variant="bordered"
                    className="mb-4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  {errors.description && (
                    <p className="error">{errors.description}</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" type="submit">
                    Save
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
