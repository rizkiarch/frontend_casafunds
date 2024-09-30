import React, { FormEvent, useContext, useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Pagination,
  SortDescriptor,
  Input,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { SearchIcon } from "../../components/SearchIcon"
import { PlusIcon } from "../../components/PlusIcon"
import { EditIcon } from "../../components/EditIcon"
import { DeleteIcon } from "../../components/DeleteIcon"
import { AppContext } from "../../contexts/AppContext"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"

type CategoryType = {
  id: number
  name: string
}

interface FormData {
  name: string
}

interface Errors {
  name?: string[]
}

export default function TableCategories() {
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterValue, setFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const hasSearchFilter = Boolean(filterValue)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  })

  useEffect(() => {
    const getCategories = async () => {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setCategories(data.categories)
      }
    }

    getCategories()
  }, [])

  const columns = [
    { key: "name", label: "NAME" },
    { key: "actions", label: "ACTIONS" },
  ]

  const renderCell = (category: CategoryType, columnKey: React.Key) => {
    const cellValue = category[columnKey as keyof CategoryType]

    switch (columnKey) {
      case "name":
        return <p className="text-bold text-small capitalize">{cellValue}</p>
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit Category">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleEditOpen(category)}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Category">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteOpen(category.id)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        )
      default:
        return <span>{cellValue}</span>
    }
  }

  //   modal edit code
  const [editFormData, setEditFormData] = useState<FormData>({ name: "" })
  const [editError, setEditError] = useState<Errors>({})
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

  const handleEditOpen = (category: CategoryType) => {
    setEditFormData({ name: category.name })
    setEditCategoryId(category.id)
    onEditOpen()
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()

    if (editCategoryId === null) return

    const result = await fetch(`/api/categories/${editCategoryId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editFormData),
    })

    const data = await result.json()

    if (data.error) {
      toast.error(data.error)
      setEditError(data.error)
    } else {
      toast.success(data.message)
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editCategoryId ? data.category : category
        )
      )
      setEditFormData({ name: "" })
      setEditCategoryId(null)
      onEditClose()
    }
  }

  //   modal delete code
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const handleDeleteOpen = (categoryId: number) => {
    setDeleteCategoryId(categoryId)
    onDeleteOpen()
  }

  const handleDelete = async () => {
    if (deleteCategoryId === null) return

    const result = await fetch(`/api/categories/${deleteCategoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const data = await result.json()

    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success(data.message)
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== deleteCategoryId)
      )
      setDeleteCategoryId(null)
      onDeleteClose()
    }
  }

  const filteredItems = React.useMemo(() => {
    return hasSearchFilter
      ? categories.filter((category) =>
          category.name.toLowerCase().includes(filterValue.toLowerCase())
        )
      : categories
  }, [categories, filterValue, hasSearchFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredItems.slice(start, start + rowsPerPage)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof CategoryType] as number
      const second = b[sortDescriptor.column as keyof CategoryType] as number
      return sortDescriptor.direction === "descending"
        ? second - first
        : first - second
    })
  }, [sortDescriptor, items])

  //   modal code
  const { isOpen, onOpen, onClose } = useDisclosure()
  const backdrop = "blur"

  //   const handleOpen = (backdrop: string) => {
  //     setBackdrop(backdrop)
  //     onOpen()
  //   }

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
            onPress={() => onOpen()}
            endContent={<PlusIcon />}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {categories.length} categories
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

  //   add data to database
  const token = useContext(AppContext)
  const [formData, setFormData] = useState<FormData>({
    name: "",
  })

  const [error, setError] = useState<Errors>({})

  async function handleCreate(e: FormEvent) {
    e.preventDefault()

    const result = await fetch("/api/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await result.json()

    if (data.error) {
      toast.error(data.error)
      setError(data.error)
    } else {
      toast.success(data.message)
      setCategories((prevCategories) => [...prevCategories, data.category])
      setFormData({ name: "" })
      onClose()
    }
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
            <TableColumn key={column.key}>{column.label}</TableColumn>
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
                Add New Category
              </ModalHeader>
              <form onSubmit={handleCreate}>
                <ModalBody>
                  <Input
                    type="text"
                    label="Name"
                    placeholder="Enter category name"
                    variant="bordered"
                    className="mb-4"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {error.name && <p className="error">{error.name[0]}</p>}
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
                Edit Category
              </ModalHeader>
              <form onSubmit={handleEdit}>
                <ModalBody>
                  <Input
                    type="text"
                    label="Name"
                    placeholder="Enter category name"
                    variant="bordered"
                    className="mb-4"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                  />
                  {editError.name && (
                    <p className="error">{editError.name[0]}</p>
                  )}
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

      <Modal backdrop={backdrop} isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onDeleteClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Category
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this category?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onDeleteClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
