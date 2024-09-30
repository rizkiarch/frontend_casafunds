import {
  Autocomplete,
  AutocompleteItem,
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  Spinner,
  Tooltip,
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
import React, { FormEvent, useContext, useEffect, useState } from "react"
import { EditIcon } from "../components/EditIcon"
import { PlusIcon } from "../components/PlusIcon"
import { SearchIcon } from "../components/SearchIcon"
import { AppContext } from "../contexts/AppContext"
import { getLocalTimeZone, today } from "@internationalized/date"
import { format, set } from "date-fns"

type PaymentType = {
  id: number
  house_id: number
  user_id: number

  user: User
  house: House
  payment_date: string
  iuran_kebersihan: number
  iuran_satpam: number
  is_paid: boolean
  paid_at: string
  description: string
}

interface User {
  id: number
  full_name: string
}

interface House {
  id: number
  address: string
  user: User
  user_id: number
}

interface FormData {
  house_id: number
  user_id: number

  payment_date: string
  iuran_kebersihan: number
  iuran_satpam: number
  description: string
}

interface Errors {
  house_id?: string
  user_id?: string
  payment_date?: string
  iuran_kebersihan?: string
  iuran_satpam?: string
  description?: string
}

export default function Payment() {
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [selectUser, setSelectUser] = useState<User[]>([])
  const [selectHouse, setSelectHouse] = useState<House[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "payment_date",
    direction: "ascending",
  })
  const hasSearchFilter = Boolean(filterValue)

  // get all payments
  useEffect(() => {
    const getPayments = async () => {
      const response = await fetch("/api/payments")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setPayments(data.payments)
      }
    }

    getPayments()
  }, [])

  // get select user
  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch("/api/users")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setSelectUser(data.users)
      }
    }
    getUsers()
  }, [])

  // get select house
  useEffect(() => {
    const getHouses = async () => {
      const response = await fetch("/api/houses")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setSelectHouse(data.houses)
      }
    }
    getHouses()
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
      key: "payment_date",
      header: "Tanggal Pembayaran",
    },
    {
      key: "iuran_kebersihan",
      header: "Iuran Kebersihan",
    },
    {
      key: "iuran_satpam",
      header: "Iuran Satpam",
    },
    {
      key: "description",
      header: "Keterangan",
    },
  ]

  const renderCell = (payment: PaymentType, columnKey: React.Key) => {
    const cellValue = payment[columnKey as keyof PaymentType]

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

    switch (columnKey) {
      case "user_id":
        return payment.user ? (
          <span>{payment.user.full_name}</span>
        ) : (
          <span>Unknown User</span>
        )
      case "house_id":
        return payment.house ? (
          <span>{payment.house.address}</span>
        ) : (
          <span>Unknown House</span>
        )
      case "payment_date":
        return cellValue ? (
          <span>{formatDate(cellValue as string)}</span>
        ) : (
          <span>Tanggal Tidak Tersedia</span>
        )
      case "iuran_kebersihan":
        return <span>{formatCurrency(cellValue)}</span>
      case "iuran_satpam":
        return <span>{formatCurrency(cellValue)}</span>
      case "description":
        return cellValue ? (
          <span>{String(cellValue)}</span>
        ) : (
          <span>Tidak ada</span>
        )
      // case "action":
      //   return (
      //     <div className="relative flex items-center gap-2">
      //       <Tooltip content="Edit user">
      //         <span
      //           className="text-lg text-default-400 cursor-pointer active:opacity-50"
      //           // onClick={() => handleEditOpen(house)}
      //         >
      //           <EditIcon />
      //         </span>
      //       </Tooltip>
      //     </div>
      //   )
    }
  }

  // get item
  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? payments.filter((payments) => {
          // payments.description.toLowerCase().includes(filterValue.toLowerCase())
          const searchValue = filterValue.toLowerCase()
          return (
            payments.user?.full_name
              .toLocaleLowerCase()
              .includes(searchValue) ||
            "" ||
            payments.house?.address.toLocaleLowerCase().includes(searchValue) ||
            "" ||
            false
          )
        })
      : payments
  }, [payments, filterValue, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = page * rowsPerPage
    return Array.isArray(filteredItems) ? filteredItems.slice(start, end) : []
  }, [filteredItems, rowsPerPage, page])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof PaymentType] as number
      const second = b[sortDescriptor.column as keyof PaymentType] as number
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
            onPress={() => onOpen()}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {payments.length} categories
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
    house_id: 0,
    user_id: null,
    payment_date: "",
    iuran_kebersihan: 0,
    iuran_satpam: 0,
    description: "",
  })

  const [errors, setErrors] = useState<Errors>({})

  async function handleCreate(e: FormEvent) {
    e.preventDefault()

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.error) {
      setErrors(data.error)
      alert(data.error)
    } else {
      alert(data.message)
      const reloadResponse = await fetch("api/payments", {
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
        setPayments(reloadData.payments)
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

  // selected User_id
  const [fieldStateUserCreate, setFieldStateUserCreate] = useState({
    selectedKey: formData.user_id,
    inputValue: "",
    items: selectUser,
  })

  console.log(selectUser)

  const onSelectionChangeUserCreate = (key: React.Key | null) => {
    if (key === null) return
    const selectedUser = selectUser.find((user) => user.id === Number(key))

    setFormData((prev) => ({
      ...prev,
      user_id: selectedUser ? selectedUser.id : 0,
    }))

    // Filter houses based on selected user
    const filteredHouses = selectHouse.filter(
      (house) => house.user_id === selectedUser?.id
    )

    setFieldStateHouseCreate((prevState) => ({
      ...prevState,
      items: filteredHouses, // Update items with the filtered houses
      inputValue: "", // Reset input value
      selectedKey: 0, // Reset selected key
    }))
    setFieldStateUserCreate((prevState) => ({
      ...prevState,
      inputValue: selectedUser ? selectedUser.full_name : "",
      selectedKey: selectedUser ? selectedUser.id : 0,
    }))
  }

  const onInputChangeUserCreate = (value: string) => {
    setFieldStateUserCreate((prevState) => {
      const filteredItems = selectUser.filter((user) =>
        user.full_name.toLowerCase().includes(value.toLowerCase())
      )

      return {
        ...prevState,
        inputValue: value,
        selectedKey: value ? 0 : prevState.selectedKey,
        items: filteredItems, // Update items with the filtered results
      }
    })
  }

  // selected house_id
  const [fieldStateHouseCreate, setFieldStateHouseCreate] = useState({
    selectedKey: formData.house_id,
    inputValue: "",
    items: selectHouse,
  })

  const onSelectionChangeHouseCreate = (key: React.Key | null) => {
    if (key === null) return
    const selectedHouse = selectHouse.find((house) => house.id === Number(key))

    setFormData((prev) => ({
      ...prev,
      house_id: selectedHouse ? selectedHouse.id : 0,
    }))

    setFieldStateHouseCreate((prevState) => ({
      ...prevState,
      inputValue: selectedHouse ? selectedHouse.address : "",
      selectedKey: selectedHouse ? selectedHouse.id : 0,
    }))
  }

  const onInputChangeHouseCreate = (value: string) => {
    setFieldStateHouseCreate((prevState) => {
      const filteredItems = selectHouse.filter((house) =>
        house.address.toLowerCase().includes(value.toLowerCase())
      )

      return {
        ...prevState,
        inputValue: value,
        selectedKey: value ? 0 : prevState.selectedKey,
        items: filteredItems, // Update items with the filtered results
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
                <TableCell>{renderCell(item, columnKey)}</TableCell>
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
                Add New Rumah
              </ModalHeader>
              <form onSubmit={handleCreate}>
                <ModalBody>
                  <Autocomplete
                    variant="bordered"
                    label="Select Penghuni"
                    className="mb-4"
                    inputValue={fieldStateUserCreate.inputValue}
                    items={fieldStateUserCreate.items}
                    selectedKey={fieldStateUserCreate.selectedKey}
                    onInputChange={onInputChangeUserCreate}
                    onSelectionChange={onSelectionChangeUserCreate}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.id}>
                        {item.full_name}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Autocomplete
                    variant="bordered"
                    label="Select Alamat Rumah"
                    className="mb-4"
                    inputValue={fieldStateHouseCreate.inputValue}
                    items={fieldStateHouseCreate.items}
                    selectedKey={fieldStateHouseCreate.selectedKey}
                    onInputChange={onInputChangeHouseCreate}
                    onSelectionChange={onSelectionChangeHouseCreate}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.id}>
                        {item.address}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Input
                    type="number"
                    label="Iuran Kebersihan"
                    id="iuran_kebersihan"
                    variant="bordered"
                    value={(formData.iuran_kebersihan || 0).toString()} // Menggunakan 0 sebagai nilai default
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        iuran_kebersihan: Number(e.target.value),
                      })
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">Rp</span>
                      </div>
                    }
                  />

                  <Input
                    type="number"
                    label="Iuran Keamanan"
                    id="iuran_keamanan"
                    variant="bordered"
                    value={(formData.iuran_satpam || 0).toString()} // Menggunakan 0 sebagai nilai default
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        iuran_satpam: Number(e.target.value),
                      })
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">Rp</span>
                      </div>
                    }
                  />
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
                        payment_date: formatStartDate, // Simpan nilai tanggal Pembayaran di formData
                      }))
                    }}
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
