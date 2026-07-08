import { Plus, X, Pencil, Trash2, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const Products = () => {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showcreatemodel, setshowcreatemodel] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const dropdownRef = useRef(null)
  
  const [formdata, setformData] = useState({
    material_code: "",
    name: "",
    supplier_id: ""
  })

  const [toasts, setToasts] = useState([])

  // Load products and suppliers on component mount
  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSupplierDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const showToast = (message, type = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  };

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${apiBaseUrl}/api/products`)
      const fetchedData = res.data
      const arrayData = Array.isArray(fetchedData) 
        ? fetchedData 
        : (fetchedData?.data || fetchedData?.products || fetchedData?.result || [])
      setProducts(arrayData)
    } catch (err) {
      console.error("Error fetching products:", err)
      showToast(err.response?.data?.message || "Failed to load products from server.", "error")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    setSuppliersLoading(true)
    try {
      const res = await axios.get(`${apiBaseUrl}/api/suppliers`)
      const fetchedData = res.data
      const arrayData = Array.isArray(fetchedData) 
        ? fetchedData 
        : (fetchedData?.data || fetchedData?.suppliers || fetchedData?.result || [])
      setSuppliers(arrayData)
    } catch (err) {
      console.error("Error fetching suppliers:", err)
      showToast("Failed to load suppliers dropdown data.", "error")
      setSuppliers([])
    } finally {
      setSuppliersLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setformData({
      material_code: "",
      name: "",
      supplier_id: ""
    })
    setshowcreatemodel(true)
  }

  const handleOpenEditModal = (product) => {
    setEditingProduct(product)
    setformData({
      material_code: product.material_code || "",
      name: product.name || "",
      supplier_id: product.supplier_id || ""
    })
    setshowcreatemodel(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formdata.material_code || !formdata.name || !formdata.supplier_id) {
      showToast("Please fill in all fields.", "error")
      return
    }

    setSubmitLoading(true)
    try {
      if (editingProduct) {
        // Update
        const id = editingProduct.id || editingProduct._id
        const res = await axios.put(`${apiBaseUrl}/api/products/${id}`, formdata)
        const updatedItem = res.data?.product || res.data?.data || res.data
        showToast("Product updated successfully!", "success")
        
        // Find the supplier object from our list to keep the UI state in sync
        const supplierObj = suppliers.find(s => String(s.id) === String(formdata.supplier_id))
        const itemWithSupplier = {
          ...updatedItem,
          supplier: supplierObj || updatedItem.supplier
        }
        
        setProducts(products.map(p => (p.id === id || p._id === id) ? itemWithSupplier : p))
      } else {
        // Create
        const res = await axios.post(`${apiBaseUrl}/api/products`, formdata)
        const newItem = res.data?.product || res.data?.data || res.data
        showToast("Product created successfully!", "success")
        
        // Find the supplier object from our list
        const supplierObj = suppliers.find(s => String(s.id) === String(formdata.supplier_id))
        const itemWithSupplier = {
          ...newItem,
          supplier: supplierObj || newItem.supplier
        }
        
        setProducts([itemWithSupplier, ...products])
      }
      setshowcreatemodel(false)
    } catch (err) {
      console.error("Error saving product:", err)
      showToast(err.response?.data?.message || "Failed to save product.", "error")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (product) => {
    const id = product.id || product._id
    if (!window.confirm(`Are you sure you want to delete product "${product.name}" (${product.material_code})?`)) return

    try {
      await axios.delete(`${apiBaseUrl}/api/products/${id}`)
      showToast("Product deleted successfully!", "success")
      setProducts(products.filter(p => (p.id !== id && p._id !== id)))
    } catch (err) {
      console.error("Error deleting product:", err)
      showToast(err.response?.data?.message || "Failed to delete product.", "error")
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
      
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Products</div>
          <div className='text-sm text-slate-500 sm:text-base'>Manage products, material codes, and assigned suppliers.</div>
        </div>

        <button
          type='button'
          className='flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0'
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          New Product
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Material Code
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Product Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Supplier
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
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-3 justify-end w-full">
                        <div className="h-5 w-5 bg-slate-200 rounded"></div>
                        <div className="h-5 w-5 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-base font-medium text-slate-400">
                      No products found. Let's add your first product!
                    </p>
                  </td>
                </tr>
              ) : (
                // Actual Rows
                products.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                      {product.material_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.supplier?.name || <span className="text-slate-400 italic">No supplier assigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-3 justify-end items-center">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
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
                    {editingProduct ? "Edit Product" : "New Product"}
                  </div>
                  <div className='mt-1 text-2xl font-bold text-slate-900'>
                    {editingProduct ? "Update Product Details" : "Register New Product"}
                  </div>
                </div>
                <button
                  type='button'
                  className='rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
                  onClick={() => {
                    setshowcreatemodel(false)
                  }}
                  aria-label='Close product form'
                >
                  <X size={20} />
                </button>
              </div>

              <form className='px-6 py-6 sm:px-8' onSubmit={handleFormSubmit}>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <label className='flex flex-col gap-2 sm:col-span-1'>
                    <span className='text-sm font-semibold text-slate-700'>Material Code</span>
                    <input
                      name='material_code'
                      type='text'
                      value={formdata.material_code}
                      placeholder='e.g., MAT-001'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-mono'
                      onChange={(e) =>
                        setformData({ ...formdata, material_code: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label className='flex flex-col gap-2 sm:col-span-1'>
                    <span className='text-sm font-semibold text-slate-700'>Product Name</span>
                    <input
                      name='name'
                      type='text'
                      value={formdata.name}
                      placeholder='e.g., Paracetamol 500mg'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      onChange={(e) =>
                        setformData({ ...formdata, name: e.target.value })
                      }
                      required
                    />
                  </label>

                  <div className='flex flex-col gap-2 sm:col-span-2 relative' ref={dropdownRef}>
                    <span className='text-sm font-semibold text-slate-700'>Supplier</span>
                    
                    <button
                      type='button'
                      onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                      className='w-full flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 text-left'
                    >
                      <span className={formdata.supplier_id ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                        {suppliers.find(s => String(s.id || s._id) === String(formdata.supplier_id))?.name || "Select a supplier"}
                      </span>
                      <ChevronDown size={18} className="text-slate-500 shrink-0" />
                    </button>

                    {showSupplierDropdown && (
                      <div className='absolute left-0 right-0 top-full z-[60] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150'>
                        {suppliersLoading ? (
                          <div className="p-3 text-sm text-slate-400 text-center animate-pulse">Loading suppliers...</div>
                        ) : suppliers.length === 0 ? (
                          <div className="p-3 text-sm text-slate-400 text-center">No suppliers available</div>
                        ) : (
                          suppliers.map((supplier) => (
                            <button
                              key={supplier.id || supplier._id}
                              type='button'
                              onClick={() => {
                                setformData({ ...formdata, supplier_id: supplier.id || supplier._id })
                                setShowSupplierDropdown(false)
                              }}
                              className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 flex items-center ${
                                String(formdata.supplier_id) === String(supplier.id || supplier._id)
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : "text-slate-700"
                              }`}
                            >
                              {supplier.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    
                    {!suppliersLoading && suppliers.length === 0 && (
                      <span className="text-xs text-red-500 mt-1">
                        No suppliers available. Please create a supplier first.
                      </span>
                    )}
                  </div>
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
                    ) : editingProduct ? (
                      "Save Changes"
                    ) : (
                      "Register Product"
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

export default Products
