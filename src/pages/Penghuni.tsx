import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
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
import { DeleteIcon } from "../components/DeleteIcon"
import { SearchIcon } from "../components/SearchIcon"
import { PlusIcon } from "../components/PlusIcon"
import { AppContext } from "../contexts/AppContext"
import { toast } from "react-toastify"

type PenghuniType = {
  id: number
  full_name: string
  phone_number: string
  //   photo_url: string

  username: string
  email: string
  password: string
  password_confirmation: string

  role: string
  status: string
  is_married: boolean
  is_active: boolean
}

interface FormData {
  full_name?: string
  phone_number?: string
  //   photo_url: string

  username?: string
  email?: string
  password?: string
  password_confirmation?: string

  role?: string
  status?: string
  is_married?: boolean
  is_active?: boolean
}

interface Errors {
  full_name?: string
  phone_number?: string
  //   photo_url?: string

  username?: string
  email?: string
  password?: string

  role?: string
  status?: string
  is_married?: string
}

export default function Penghuni() {
  const [penghuni, setPenghuni] = useState<PenghuniType[]>([])
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
    const getCategories = async () => {
      const response = await fetch("api/users")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setPenghuni(data.users)
      }
    }

    getCategories()
  }, [])

  const columns = [
    {
      key: "full_name",
      header: "Nama Lengkap",
      sortable: true,
    },
    {
      key: "phone_number",
      header: "Nomor Telepon",
    },
    {
      key: "photo_url",
      header: "Foto",
    },
    {
      key: "username",
      header: "Username",
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
    },
    {
      key: "is_married",
      header: "Menikah",
    },
    {
      key: "action",
      header: "Aksi",
      sortable: false,
    },
  ]

  const selectStatus = [
    {
      key: "Kontrak",
      value: "kontrak",
    },
    {
      key: "Tetap",
      value: "tetap",
    },
  ]

  const selectRoles = [
    {
      key: "Admin",
      value: "admin",
    },
    {
      key: "Penghuni",
      value: "user",
    },
  ]

  const selectIsMarried = [
    {
      key: "Ya",
      value: true,
    },
    {
      key: "Tidak",
      value: false,
    },
  ]

  const selectIsActive = [
    {
      key: "Aktif",
      value: true,
    },
    {
      key: "Tidak Aktif",
      value: false,
    },
  ]

  // useEffect(() => {
  //     const getStorageLink = async () => {
  //         try {
  //             const response = await fetch("http://127.0.0.1:8000/storage");
  //             const data = await response.json();

  //             console.log("Storage link:", data);
  //         } catch (error) {
  //             console.error("Error fetching storage link:", error);
  //         }
  //     };

  //     getStorageLink();
  // }, []);

  //   useEffect(() => {
  //     const fetchUserPhotos = async () => {
  //       try {
  //         console.log("Fetching photos for users:", penghuni)

  //         const updatedPenghuni = await Promise.all(
  //           penghuni.map(async (user) => {
  //             const response = await fetch(
  //               `http://127.0.0.1:8000/storage/${user.photo_url}`
  //             )
  //             const photoUrl = await response.json()
  //             console.log("Fetch response:", response)

  //             return { ...user, photo_url: photoUrl }
  //           })
  //         )
  //         console.log("Updated penghuni data:", updatedPenghuni)

  //         setPenghuni(updatedPenghuni)
  //       } catch (error) {
  //         console.error("Error fetching user photos:", error)
  //       }
  //     }

  //     if (penghuni.length > 0) {
  //       fetchUserPhotos()
  //     }
  //   }, [penghuni])

  const renderCell = (penghuni: PenghuniType, columnKey: React.Key) => {
    const cellValue = penghuni[columnKey as keyof PenghuniType]

    switch (columnKey) {
      case "full_name":
        return (
          <span className="text-bold text-small capitalize">{cellValue}</span>
        )
      case "photo_url":
        return (
          <img
            src={penghuni.photo_url}
            alt={penghuni.full_name}
            width="50"
            height="50"
          />
        )
      case "status":
        return (
          <>
            {cellValue === "kontrak" ? (
              <Chip
                className="capitalize"
                size="sm"
                variant="flat"
                color="success"
              >
                {cellValue}
              </Chip>
            ) : (
              <Chip
                className="capitalize"
                size="sm"
                variant="flat"
                color="warning"
              >
                {cellValue}
              </Chip>
            )}
          </>
        )
      case "phone_number":
        return <span className="text-small">{cellValue}</span>
      case "is_married":
        return <span className="text-small">{cellValue ? "Ya" : "Tidak"}</span>
      case "action":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit user">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleEditOpen(penghuni)}
              >
                <EditIcon />
              </span>
            </Tooltip>
            {/* <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip> */}
          </div>
        )
      default:
        return <span className="text-small">{cellValue}</span>
    }
  }

  const [editFormData, setEditFormData] = useState<FormData>({
    full_name: "",
    phone_number: "",
    // photo_url: "",

    username: "",
    email: "",
    password: "",
    role: "",
    status: "",
    is_married: false,
    is_active: false,
  })
  const [editErrors, setEditErrors] = useState<Errors>({})
  const [editPenghuniId, setEditPenghuniId] = useState<number | null>(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

  const handleEditOpen = (penghuni: PenghuniType) => {
    setEditPenghuniId(penghuni.id)
    setEditFormData({
      full_name: penghuni.full_name,
      phone_number: penghuni.phone_number,
      // photo_url: penghuni.photo_url,

      username: penghuni.username,
      email: penghuni.email,
      password: penghuni.password,
      role: penghuni.role,
      status: penghuni.status,
      is_married: penghuni.is_married,
      is_active: penghuni.is_active,
    })
    onEditOpen()
  }

  console.log(editFormData.role)

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()

    if (editPenghuniId === null) return

    const response = await fetch(`api/users/${editPenghuniId}`, {
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
      setPenghuni((prevPenghuni) =>
        prevPenghuni.map((penghuni) =>
          penghuni.id === editPenghuniId
            ? { ...penghuni, ...editFormData }
            : penghuni
        )
      )

      setEditFormData({})
      setEditPenghuniId(null)
      onEditClose()
    }
  }

  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? penghuni.filter((penghuni) =>
          penghuni.full_name.toLowerCase().includes(filterValue.toLowerCase())
        )
      : penghuni
  }, [penghuni, filterValue, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredItems.slice(start, start + rowsPerPage)
  }, [filteredItems, rowsPerPage, page])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof PenghuniType] as number
      const second = b[sortDescriptor.column as keyof PenghuniType] as number
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
          placeholder="Search by name..."
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
          Total {penghuni.length} categories
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

  //   add data to database
  const { isOpen, onOpen, onClose } = useDisclosure()
  const backdrop = "blur"

  const token = useContext(AppContext)
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone_number: "",
    // photo_url: "",

    username: "",
    email: "",
    password: "",

    role: "",
    status: "",
    is_married: false,
    is_active: false,
  })

  const [errors, setErrors] = useState<Errors>({})

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    // try {
    alert("Data berhasil ditambahkan")
    const response = await fetch("api/users", {
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
      setPenghuni((prevPenghuni) => [...prevPenghuni, data.user])
      setFormData({})
      onClose()
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
      <div className="hidden sm:flex w-[30%] justify-end gap-2">
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
            <TableColumn key={column.key} allowsSorting={column.sortable}>
              {column.header}
            </TableColumn>
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

      {/* modal create */}
      <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Category
              </ModalHeader>
              <form onSubmit={handleCreate}>
                <ModalBody>
                  <Input
                    type="text"
                    label="Full Name"
                    id="full_name"
                    placeholder="Enter full name"
                    variant="bordered"
                    className="mb-4"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                  {errors.full_name && (
                    <p className="error">{errors.full_name}</p>
                  )}

                  <Input
                    type="text"
                    label="Phone Number"
                    id="phone_number"
                    placeholder="Enter phone number"
                    variant="bordered"
                    className="mb-4"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                  {errors.phone_number && (
                    <p className="error">{errors.phone_number}</p>
                  )}

                  <Input
                    type="text"
                    label="Username"
                    id="username"
                    placeholder="Enter username"
                    variant="bordered"
                    className="mb-4"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                  {errors.username && (
                    <p className="error">{errors.username}</p>
                  )}

                  <Input
                    type="email"
                    label="Email"
                    id="email"
                    placeholder="Enter email"
                    variant="bordered"
                    className="mb-4"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && <p className="error">{errors.email}</p>}

                  <Input
                    type="password"
                    label="Password"
                    id="password"
                    placeholder="Enter password"
                    variant="bordered"
                    className="mb-4"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  {errors.password && (
                    <p className="error">{errors.password}</p>
                  )}

                  <Select
                    label="Select Role"
                    id="role"
                    variant="bordered"
                    className="mb-4"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                  >
                    {selectRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.key}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Select Status"
                    id="status"
                    variant="bordered"
                    className="mb-4"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                  >
                    {selectStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.key}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Select Married Status"
                    id="married_status"
                    variant="bordered"
                    className="mb-4"
                    value={formData.is_married?.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_married: e.target.value === "true",
                      })
                    }
                  >
                    {selectIsMarried.map((status) => (
                      <SelectItem
                        key={status.value.toString()}
                        value={status.value.toString()}
                      >
                        {status.key}
                      </SelectItem>
                    ))}
                  </Select>
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

      {/* modal edit */}
      <Modal backdrop={backdrop} isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          {(onEditClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Category
              </ModalHeader>
              <form onSubmit={handleEdit}>
                <ModalBody>
                  <Input
                    type="text"
                    label="Full Name"
                    id="full_name"
                    placeholder="Enter full name"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.full_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        full_name: e.target.value,
                      })
                    }
                  />
                  {editErrors.full_name && (
                    <p className="error">{editErrors.full_name}</p>
                  )}

                  <Input
                    type="text"
                    label="Phone Number"
                    id="phone_number"
                    placeholder="Enter phone number"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.phone_number}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                  {editErrors.phone_number && (
                    <p className="error">{editErrors.phone_number}</p>
                  )}

                  <Input
                    type="text"
                    label="Username"
                    id="username"
                    placeholder="Enter username"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.username}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        username: e.target.value,
                      })
                    }
                  />
                  {editErrors.username && (
                    <p className="error">{editErrors.username}</p>
                  )}

                  <Input
                    type="email"
                    label="Email"
                    id="email"
                    placeholder="Enter email"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                  />
                  {editErrors.email && (
                    <p className="error">{editErrors.email}</p>
                  )}

                  <Select
                    label="Select Role"
                    id="role"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.role}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        role: e.target.value,
                      })
                    }}
                  >
                    {selectRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.key}
                      </SelectItem>
                    ))}
                  </Select>

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

                  <Select
                    label="Select Married Status"
                    id="married_status"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.is_married?.toString()}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        is_married: e.target.value === "true",
                      })
                    }}
                  >
                    {selectIsMarried.map((status) => (
                      <SelectItem
                        key={status.value.toString()}
                        value={status.value.toString()}
                      >
                        {status.key}
                      </SelectItem>
                    ))}
                  </Select>
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
