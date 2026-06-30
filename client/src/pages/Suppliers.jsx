import { Plus, X, Pencil, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showcreatemodel, setshowcreatemodel] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  
  const [formdata, setformData] = useState({
    name: "",
    contactno: "",
    address: ""
  })

  const [toasts, setToasts] = useState([])

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  const showToast = (message, type = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  };

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${apiBaseUrl}/api/suppliers`)
      const fetchedData = res.data
      const arrayData = Array.isArray(fetchedData) 
        ? fetchedData 
        : (fetchedData?.data || fetchedData?.suppliers || fetchedData?.result || [])
      setSuppliers(arrayData)
    } catch (err) {
      console.error("Error fetching suppliers:", err)
      showToast(err.response?.data?.message || "Failed to load suppliers from server.", "error")
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingSupplier(null)
    setformData({
      name: "",
      contactno: "",
      address: ""
    })
    setshowcreatemodel(true)
  }

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier)
    setformData({
      name: supplier.name || "",
      contactno: supplier.contactno || "",
      address: supplier.address || ""
    })
    setshowcreatemodel(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formdata.name || !formdata.contactno || !formdata.address) {
      showToast("Please fill in all fields.", "error")
      return
    }

    setSubmitLoading(true)
    try {
      if (editingSupplier) {
        // Update
        const id = editingSupplier.id || editingSupplier._id
        const res = await axios.put(`${apiBaseUrl}/api/suppliers/${id}`, formdata)
        const updatedItem = res.data?.data || res.data?.supplier || res.data
        showToast("Supplier updated successfully!", "success")
        setSuppliers(suppliers.map(s => (s.id === id || s._id === id) ? updatedItem : s))
      } else {
        // Create
        const res = await axios.post(`${apiBaseUrl}/api/suppliers`, formdata)
        const newItem = res.data?.data || res.data?.supplier || res.data
        showToast("Supplier registered successfully!", "success")
        setSuppliers([newItem, ...suppliers])
      }
      setshowcreatemodel(false)
    } catch (err) {
      console.error("Error saving supplier:", err)
      showToast(err.response?.data?.message || "Failed to save supplier.", "error")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (supplier) => {
    const id = supplier.id || supplier._id
    if (!window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) return

    try {
      await axios.delete(`${apiBaseUrl}/api/suppliers/${id}`)
      showToast("Supplier deleted successfully!", "success")
      setSuppliers(suppliers.filter(s => (s.id !== id && s._id !== id)))
    } catch (err) {
      console.error("Error deleting supplier:", err)
      showToast(err.response?.data?.message || "Failed to delete supplier.", "error")
    }
  }

  return (
    <div className='flex flex-col gap-6 p-4 sm:p-6 lg:p-8 relative'>
      {/* Top Right Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-x-0 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 pl-2"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className='flex flex-col md:flex-row md:justify-between'>
      <div className='flex flex-col gap-2'>
        <div className='text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Suppliers</div>
        <div className='text-sm text-slate-500 sm:text-base'>Manage supplier contacts, addresses, and registration details.</div>
      </div>

      <button
        type='button'
        className='flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0'
        onClick={handleOpenAddModal}
      >
        <Plus size={18} />
        New Supplier
      </button>
</div>
      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Supplier Identity
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Detail
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Location / Address
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton Loader
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-3 justify-end w-full">
                        <div className="h-5 w-5 bg-slate-200 rounded"></div>
                        <div className="h-5 w-5 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-base font-medium text-slate-400">
                      No suppliers found. Let's add your first partner!
                    </p>
                  </td>
                </tr>
              ) : (
                // Actual Rows
                suppliers.map((supplier) => (
                  <tr key={supplier.id || supplier._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.contactno}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-3 justify-end items-center">
                        <button
                          onClick={() => handleOpenEditModal(supplier)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {
        showcreatemodel && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm'>
            <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200'>
              <div className='flex items-start justify-between border-b border-slate-200 px-6 py-5 sm:px-8'>
                <div>
                  <div className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>
                    {editingSupplier ? "Edit Supplier" : "New Supplier"}
                  </div>
                  <div className='mt-1 text-2xl font-bold text-slate-900'>
                    {editingSupplier ? "Update Supplier Details" : "Register New Supplier"}
                  </div>
                </div>
                <button
                  type='button'
                  className='rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
                  onClick={() => {
                    setshowcreatemodel(false)
                  }}
                  aria-label='Close supplier form'
                >
                  <X size={20} />
                </button>
              </div>

              <form className='px-6 py-6 sm:px-8' onSubmit={handleFormSubmit}>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <label className='flex flex-col gap-2 sm:col-span-1'>
                    <span className='text-sm font-semibold text-slate-700'>Supplier Name</span>
                    <input
                      name='name'
                      type='text'
                      value={formdata.name}
                      placeholder='Hemas Pharmaceuticals'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      onChange={(e) =>
                        setformData({ ...formdata, name: e.target.value })
                      }
                    />
                  </label>

                  <label className='flex flex-col gap-2 sm:col-span-1'>
                    <span className='text-sm font-semibold text-slate-700'>Contact Number</span>
                    <input
                      name='contactno'
                      type='tel'
                      value={formdata.contactno}
                      placeholder='0768987589'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      onChange={(e) =>
                        setformData({ ...formdata, contactno: e.target.value })
                      }
                    />
                  </label>

                  <label className='flex flex-col gap-2 sm:col-span-2'>
                    <span className='text-sm font-semibold text-slate-700'>Business Address</span>
                    <textarea
                      name='address'
                      rows='4'
                      value={formdata.address}
                      placeholder='Full address'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      onChange={(e) =>
                        setformData({ ...formdata, address: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                  <button
                    type='button'
                    className='rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    onClick={() => {
                      setshowcreatemodel(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={submitLoading}
                    className='rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 flex items-center justify-center gap-2 min-w-[150px]'
                  >
                    {submitLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : editingSupplier ? (
                      "Save Changes"
                    ) : (
                      "Register Supplier"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Suppliers
