import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react"
import React, { FormEvent, useContext, useEffect, useState } from "react"
import { EditIcon } from "../components/EditIcon"
import { SearchIcon } from "../components/SearchIcon"
import { PlusIcon } from "../components/PlusIcon"
import { AppContext } from "../contexts/AppContext"
import { toast } from "react-toastify"
import { getLocalTimeZone, today } from "@internationalized/date"
import { format } from "date-fns"
import { pre } from "framer-motion/client"

type HouseType = {
  id: number
  user: User
  address: string
  status: string
  user_id: number | null

  start_date: string
  end_date: string
}

interface FormData {
  user: User
  user_id: number | null
  address: string
  status: string

  start_date: string
  end_date: string
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
  const [selectUser, setSelectUser] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // console.log(houses)

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
      key: "start_date",
      header: "Tanggal Di Huni",
    },
    {
      key: "end_date",
      header: "Tanggal Berakhir",
    },
    {
      key: "actions",
      header: "Actions",
    },
  ]

  const selectStatus = [
    {
      key: "Dihuni",
      value: "Dihuni",
    },
    {
      key: "Kosong",
      value: "Kosong",
    },
  ]

  const renderCell = (house: HouseType, columnKey: React.Key) => {
    const cellValue = house[columnKey as keyof HouseType]
    console.log(house)

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
          <span>Tanggal Tidak Tersedia</span>
        )
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit user">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleEditOpen(house)}
              >
                <EditIcon />
              </span>
            </Tooltip>
          </div>
        )
    }
  }

  //   edit modal
  const [editFormData, setEditFormData] = useState<FormData>({
    user: { id: 0, full_name: "" },
    user_id: null,
    address: "",
    status: "",
    start_date: "",
    end_date: "",
  })

  const [editErrors, setEditErrors] = useState<Errors>({})
  const [editHouseId, setEditHouseId] = useState<number | null>(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

  const handleEditOpen = (house: HouseType) => {
    setEditHouseId(house.id)
    setEditFormData({
      user: house.user,
      user_id: house.user ? house.user.id : null,
      address: house.address,
      status: house.status,
      start_date: "", // Provide default value or fetch from house if available
      end_date: "", // Provide default value or fetch from house if available
    })

    // Set field state untuk autocomplete
    setFieldState({
      selectedKey: house.user ? house.user.id : null, // Mengatur selectedKey dengan user_id dari house
      inputValue: house.user ? house.user.full_name : "",
      items: selectUser, // Pastikan items diisi
    })
    onEditOpen()
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()

    if (editHouseId === null) return

    const response = await fetch(`api/houses/${editHouseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(editFormData),
    })

    const data = await response.json()

    if (data.error) {
      toast.error(data.message)
      setEditErrors(data.errors)
    } else {
      toast.success(data.message)
      setHouses((prevHouse) =>
        prevHouse.map((house) =>
          house.id === editHouseId ? { ...house, ...editFormData } : house
        )
      )
      onEditClose()
    }
    setEditHouseId(null)
    setEditFormData({})
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
            onPress={() => onOpen()}
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  const backdrop = "blur"
  const token = useContext(AppContext)
  const [formData, setFormData] = useState<FormData>({
    user: { id: 0, full_name: "" },
    user_id: null,
    address: "",
    status: "",
    start_date: "",
    end_date: "",
  })

  const [errors, setErrors] = useState<Errors>({})

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    alert("Data berhasil ditambahkan")
    const response = await fetch("api/houses", {
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
      toast.error(data.message)
      setErrors(data.errors)
    } else {
      toast.success(data.message)
      const reloadResponse = await fetch("api/houses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const housesData = await reloadResponse.json()
      if (housesData.error) {
        toast.error("Gagal memuat ulang data rumah.")
      } else {
        setHouses(housesData.houses) // Update state dengan semua data houses
        setFormData({}) // Reset form
        onClose() // Tutup modal
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

  // Store input value and items
  const [fieldState, setFieldState] = useState({
    selectedKey: formData.user_id,
    inputValue: "",
    items: selectUser,
  })

  const onSelectionChange = (key: React.Key) => {
    const selectedUser = selectUser.find((user) => user.id === Number(key))
    setFormData((prev) => ({
      ...prev,
      user: selectedUser || { id: 0, full_name: "" },
      user_id: selectedUser ? selectedUser.id : null, // Update user_id
    }))

    setFieldState((prevState) => ({
      ...prevState,
      inputValue: selectedUser?.full_name || "",
      selectedKey: selectedUser ? selectedUser.id : null,
    }))
  }

  const onInputChange = (value: string) => {
    setFieldState((prevState) => {
      // Filter item berdasarkan input
      const filteredItems = selectUser.filter((item) =>
        item.full_name.toLowerCase().startsWith(value.toLowerCase())
      )

      return {
        ...prevState,
        inputValue: value,
        selectedKey: value === "" ? null : prevState.selectedKey,
        items: filteredItems, // Perbarui item dengan hasil filter
      }
    })
  }

  //   edit input value
  const [fieldStateEdit, setFieldStateEdit] = useState({
    selectedKey: editFormData.user_id || null,
    inputValue: "",
    items: selectUser,
  })

  // console.log(fieldStateEdit.selectedKey)

  const onSelectionChangeEdit = (key) => {
    const selectedUser = selectUser.find((user) => user.id === Number(key))
    setEditFormData((prev) => ({
      ...prev,
      user: selectedUser || { id: 0, full_name: "" },
      user_id: selectedUser ? selectedUser.id : null, // Update user_id
    }))

    setFieldStateEdit((prevState) => ({
      ...prevState,
      inputValue: selectedUser?.full_name || "",
      selectedKey: selectedUser ? selectedUser.id : null,
    }))
  }

  const onInputChangeEdit = (value) => {
    const filteredItems = selectUser.filter((item) =>
      item.full_name.toLowerCase().startsWith(value.toLowerCase())
    )

    setFieldStateEdit((prevState) => ({
      ...prevState,
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: filteredItems, // Perbarui item dengan hasil filter
    }))
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
                    inputValue={fieldState.inputValue}
                    items={fieldState.items}
                    selectedKey={fieldState.selectedKey}
                    onInputChange={onInputChange}
                    onSelectionChange={onSelectionChange}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.id}>
                        {item.full_name}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Input
                    isRequired
                    type="text"
                    label="Address"
                    id="address"
                    variant="bordered"
                    className="mb-4"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                  {errors.address && <p className="error">{errors.address}</p>}

                  <Select
                    isRequired
                    label="Select Status"
                    id="status"
                    variant="bordered"
                    className="mb-4"
                    value={formData.status || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }}
                  >
                    {selectStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.key}
                      </SelectItem>
                    ))}
                  </Select>

                  <DatePicker
                    isRequired
                    className="bordered"
                    label="Tanggal Mulai"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).subtract({
                      days: 1,
                    })}
                    onChange={(date) => {
                      const formatStartDate = format(date, "yyyy-MM-dd")

                      setFormData((prev) => ({
                        ...prev,
                        start_date: formatStartDate, // Simpan nilai tanggal mulai di formData
                      }))
                    }}
                  />

                  <DatePicker
                    className="bordered"
                    label="Tanggal Berakhir"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).subtract({
                      days: 1,
                    })}
                    onChange={(date) => {
                      const formatEndDate = format(date, "yyyy-MM-dd")

                      setFormData((prev) => ({
                        ...prev,
                        end_date: formatEndDate, // Simpan nilai tanggal mulai di formData
                      }))
                    }}
                  />
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

      <Modal backdrop={backdrop} isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          {(onEditClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Rumah
              </ModalHeader>
              <form onSubmit={handleEdit}>
                <ModalBody>
                  <Autocomplete
                    variant="bordered"
                    label="Select Penghuni"
                    className="mb-4"
                    inputValue={fieldStateEdit.inputValue}
                    items={fieldStateEdit.items}
                    selectedKey={fieldStateEdit.selectedKey}
                    onInputChange={onInputChangeEdit}
                    onSelectionChange={onSelectionChangeEdit}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.id}>
                        {item.full_name}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Input
                    type="text"
                    label="Address"
                    id="address"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                  />
                  {editErrors.address && (
                    <p className="error">{editErrors.address}</p>
                  )}

                  <Select
                    label="Select Status"
                    id="status"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.status}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }}
                  >
                    {selectStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.key}
                      </SelectItem>
                    ))}
                  </Select>

                  <DatePicker
                    className="bordered"
                    label="Tanggal Mulai"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).subtract({
                      days: 1,
                    })}
                    onChange={(date) => {
                      const formatStartDate = format(date, "yyyy-MM-dd")

                      setEditFormData((prev) => ({
                        ...prev,
                        start_date: formatStartDate, // Simpan nilai tanggal mulai di formData
                      }))
                    }}
                  />

                  <DatePicker
                    className="bordered"
                    label="Tanggal Berakhir"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).subtract({
                      days: 1,
                    })}
                    onChange={(date) => {
                      const formatEndDate = format(date, "yyyy-MM-dd")

                      setEditFormData((prev) => ({
                        ...prev,
                        end_date: formatEndDate, // Simpan nilai tanggal mulai di formData
                      }))
                    }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onEditClose}>
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
