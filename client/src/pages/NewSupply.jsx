import React, { useState, useEffect, useRef } from "react";
import { useWarehouse } from "../context/WarehouseContext";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Package, Pencil, Trash2, X, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const NewSupply = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editInvoiceId = location.state?.invoiceId;

  // Navigation & Context State
  const { refreshTotalValue } = useWarehouse();
  const [step, setStep] = useState("invoice"); // "invoice" | "items"
  const [originalInvoiceTotal, setOriginalInvoiceTotal] = useState(0);

  // Invoice State
  const [invoiceData, setInvoiceData] = useState({
    supplier_id: "",
    supplier_name: "",
    invoice_no: "",
    invoice_date: new Date().toISOString().split("T")[0],
    total_bill_amount: "",
  });

  const [suppliers, setSuppliers] = useState([]);

  // Items State
  const [batchItems, setBatchItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Batch Entry State
  const [activeProduct, setActiveProduct] = useState(null);
  const [batchForm, setBatchForm] = useState({
    no_cases: "",
    pack_size: "",
    extra_units: "0",
    free_qty: "0",
    retail_price: "",
    net_price: "",
    expiry_date: "",
  });

  const [editingItemId, setEditingItemId] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedInvoiceSummary, setSavedInvoiceSummary] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const searchInputRef = useRef(null);

  // Auto-focus logic for scanner support
  useEffect(() => {
    if (
      step === "items" &&
      !activeProduct &&
      !showAddProductModal &&
      !showConfirmSave &&
      !showConfirmCancel &&
      !showSuccessModal
    ) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [
    step,
    activeProduct,
    showAddProductModal,
    showConfirmSave,
    showConfirmCancel,
    showSuccessModal,
  ]);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, suppRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/products`),
        axios.get(`${apiBaseUrl}/api/suppliers`),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.products || []);
      setSuppliers(Array.isArray(suppRes.data) ? suppRes.data : suppRes.data?.suppliers || []);

      // If editing, fetch invoice details
      if (editInvoiceId) {
        const invRes = await axios.get(
          `${apiBaseUrl}/api/supplier-invoices/${editInvoiceId}`,
        );
        const inv = invRes.data?.invoice || invRes.data;

        setInvoiceData({
          supplier_id: (inv.supplier_id || "").toString(),
          supplier_name: inv.supplier?.name || "",
          invoice_no: inv.invoice_number || "",
          invoice_date: inv.invoice_date || new Date().toISOString().split("T")[0],
          total_bill_amount: (inv.total_bill_amount || 0).toString(),
        });
        setOriginalInvoiceTotal(Number(inv.total_bill_amount || 0));

        const batchList = inv.batch_stocks || inv.batchStocks || [];
        const items = batchList.map((bs) => ({
          temp_id: bs.id,
          product_id: bs.product_id,
          product_name: bs.product?.name || "Unknown Product",
          material_code: bs.product?.material_code || "",
          barcode: bs.product?.barcode || bs.product?.material_code || "",
          no_cases: bs.no_cases || 0,
          pack_size: bs.pack_size || 0,
          extra_units: bs.extra_units || 0,
          qty: bs.qty || bs.remain_qty || 0,
          free_qty: bs.free_qty || 0,
          retail_price: Number(bs.retail_price || 0),
          netprice: Number(bs.netprice || 0),
          expiry_date: bs.expiry_date || "",
        }));

        setBatchItems(items);
        setStep("items");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const directMatch = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === term) ||
        (p.material_code && p.material_code.toLowerCase() === term),
    );

    if (directMatch) {
      handleSelectProduct(directMatch);
      setSearchTerm("");
      return;
    }

    const filtered = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.barcode && p.barcode.toLowerCase().includes(term)) ||
        (p.material_code && p.material_code.toLowerCase() === term),
    );
    setSearchResults(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, products]);

  const handleSelectProduct = (product) => {
    setActiveProduct(product);
    setSearchResults([]);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelectProduct(searchResults[highlightedIndex]);
      } else if (searchResults.length === 1) {
        handleSelectProduct(searchResults[0]);
      } else if (searchResults.length === 0 && searchTerm.trim().length > 0) {
        setNewProduct({
          ...newProduct,
          name: isNaN(Number(searchTerm)) ? searchTerm : "",
          material_code: searchTerm,
          barcode: searchTerm,
          supplier_id: Number(invoiceData.supplier_id),
        });
        setShowAddProductModal(true);
        setSearchTerm("");
      }
    } else if (e.key === "Escape") {
      setSearchResults([]);
      setHighlightedIndex(-1);
    }
  };

  const handleProceedToItems = (e) => {
    e.preventDefault();
    if (!invoiceData.supplier_id || !invoiceData.invoice_no) {
      alert("Please fill in the required invoice details.");
      return;
    }
    setOriginalInvoiceTotal(Number(invoiceData.total_bill_amount || 0));
    setStep("items");
  };

  const handleBatchFormKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (!form) return;
      const inputs = Array.from(
        form.querySelectorAll("input, select, textarea"),
      );
      const idx = inputs.indexOf(e.currentTarget);
      if (idx >= 0 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    }
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    const cases = Number(batchForm.no_cases || 0);
    const pSize = Number(batchForm.pack_size || 0);
    const extras = Number(batchForm.extra_units || 0);
    const freeQty = Number(batchForm.free_qty || 0);
    const qty = cases * pSize + extras + freeQty;

    if (qty === 0 && freeQty === 0) {
      alert("Please enter at least a quantity or free quantity.");
      return;
    }

    const itemData = {
      temp_id: editingItemId || Date.now(),
      product_id: activeProduct.id,
      product_name: activeProduct.name,
      material_code: activeProduct.material_code,
      barcode: activeProduct.barcode || activeProduct.material_code || "",
      no_cases: cases,
      pack_size: pSize,
      extra_units: extras,
      qty: qty,
      free_qty: freeQty,
      retail_price: Number(batchForm.retail_price || 0),
      netprice: Number(batchForm.net_price || 0),
      expiry_date: batchForm.expiry_date || null,
    };

    if (editingItemId) {
      setBatchItems(
        batchItems.map((i) => (i.temp_id === editingItemId ? itemData : i)),
      );
    } else {
      setBatchItems([...batchItems, itemData]);
    }

    setActiveProduct(null);
    setEditingItemId(null);
    setBatchForm({
      no_cases: "",
      pack_size: "",
      extra_units: "0",
      free_qty: "0",
      retail_price: "",
      net_price: "",
      expiry_date: "",
    });
  };

  const handleEditItem = (item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    setActiveProduct(product);
    setEditingItemId(item.temp_id);
    setBatchForm({
      no_cases: item.no_cases.toString(),
      pack_size: item.pack_size.toString(),
      extra_units: (item.extra_units || 0).toString(),
      free_qty: (item.free_qty || 0).toString(),
      retail_price: item.retail_price.toString(),
      net_price: item.netprice.toString(),
      expiry_date: item.expiry_date || "",
    });
  };

  const handleRemoveItem = (id) => {
    setBatchItems(batchItems.filter((i) => i.temp_id !== id));
  };

  const getItemsTotal = () => {
    return batchItems.reduce(
      (sum, item) => sum + (item.qty - (item.free_qty || 0)) * item.netprice,
      0,
    );
  };

  const isTotalMatched = Math.abs(getItemsTotal() - originalInvoiceTotal) < 0.01;

  const handleCompleteSupply = async () => {
    setLoading(true);
    try {
      const payload = {
        supplier_id: Number(invoiceData.supplier_id),
        invoice_number: invoiceData.invoice_no,
        invoice_date: invoiceData.invoice_date,
        total_bill_amount: Number(originalInvoiceTotal),
        items: batchItems.map((item) => ({
          product_id: item.product_id,
          no_cases: item.no_cases,
          pack_size: item.pack_size,
          extra_units: item.extra_units,
          qty: item.qty,
          free_qty: item.free_qty,
          retail_price: item.retail_price,
          netprice: item.netprice,
          expiry_date: item.expiry_date || null,
        })),
      };

      if (editInvoiceId) {
        await axios.put(
          `${apiBaseUrl}/api/supplier-invoices/${editInvoiceId}`,
          payload,
        );
      } else {
        await axios.post(
          `${apiBaseUrl}/api/supplies`,
          payload,
        );
      }

      if (refreshTotalValue) {
        await refreshTotalValue();
      }

      setSavedInvoiceSummary({
        invoice_number: invoiceData.invoice_no,
        supplier_name: invoiceData.supplier_name,
        target_total: originalInvoiceTotal,
        items_total: getItemsTotal(),
        items_count: batchItems.length,
        is_matched: isTotalMatched,
      });

      setShowConfirmSave(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Supply save error:", err);
      alert(err.response?.data?.message || "Failed to save supply record.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("invoice");
    setInvoiceData({
      supplier_id: "",
      supplier_name: "",
      invoice_no: "",
      invoice_date: new Date().toISOString().split("T")[0],
      total_bill_amount: "",
    });
    setBatchItems([]);
    setEditingItemId(null);
    setActiveProduct(null);
    setShowConfirmCancel(false);
    setShowConfirmSave(false);
    setShowSuccessModal(false);
    setSavedInvoiceSummary(null);
    setOriginalInvoiceTotal(0);
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    material_code: "",
    barcode: "",
    supplier_id: 0,
  });

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/products`,
        newProduct,
      );
      const createdProd = res.data?.product || res.data?.data || res.data;
      setProducts([...products, createdProd]);
      setShowAddProductModal(false);
      handleSelectProduct(createdProd);
      setNewProduct({
        name: "",
        material_code: "",
        barcode: "",
        supplier_id: 0,
      });
    } catch (err) {
      console.error("Error creating product:", err);
      alert(err.response?.data?.message || "Failed to create product.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 text-slate-800 text-xs">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              New Supply Entry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Record and manage incoming inventory batches from suppliers
            </p>
          </div>

          {step === "items" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmSave(true)}
                disabled={batchItems.length === 0}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Complete Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {step === "invoice" ? (
          /* STEP 1: Invoice Details Form */
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h2 className="text-base font-bold text-slate-800">
                Invoice Preliminary Details
              </h2>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Step 1: Header Information
              </p>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleProceedToItems}>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 transition"
                  value={invoiceData.supplier_id}
                  required
                  onChange={(e) => {
                    const selected = suppliers.find(
                      (s) => s.id.toString() === e.target.value,
                    );
                    setInvoiceData({
                      ...invoiceData,
                      supplier_id: e.target.value,
                      supplier_name: selected ? selected.name : "",
                    });
                  }}
                >
                  <option value="">Select a Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2024-001"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400 transition"
                    value={invoiceData.invoice_no}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        invoice_no: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 transition"
                    value={invoiceData.invoice_date}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        invoice_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Total Bill Amount (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400 transition"
                  value={invoiceData.total_bill_amount}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      total_bill_amount: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Proceed to Add Items"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Stock Items Section */
          <div className="space-y-4">
            {/* Header Summary Bar with Live Matching Indicator */}
            <div className="bg-white px-5 py-3.5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-5 items-center justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Supplier
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {invoiceData.supplier_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Invoice No.
                  </span>
                  <span className="text-xs font-bold text-blue-600">
                    #{invoiceData.invoice_no}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Invoice Date
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {invoiceData.invoice_date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 border-l border-slate-200 pl-5">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Entered Target Total
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Rs. {Number(originalInvoiceTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Added Items Total
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isTotalMatched
                        ? "text-emerald-600"
                        : getItemsTotal() > originalInvoiceTotal
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    Rs. {getItemsTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  {isTotalMatched ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Totals Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                      <AlertTriangle size={12} className="text-amber-600" />
                      Diff: Rs. {Math.abs(originalInvoiceTotal - getItemsTotal()).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Search & Barcode Scan */}
            <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-slate-800 placeholder:text-slate-400 transition"
                placeholder="Scan Barcode or Search by Product Name / Material Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-3.5 right-3.5 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                  {searchResults.map((p, index) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`px-3.5 py-2 cursor-pointer border-b border-slate-100 flex items-center justify-between text-xs transition ${
                        highlightedIndex === index
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[11px] ${highlightedIndex === index ? "text-blue-100" : "text-slate-400"}`}>
                          {p.barcode || p.material_code}
                        </span>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                      <span className={`text-[11px] ${highlightedIndex === index ? "text-white" : "text-slate-400"}`}>
                        {p.supplier?.name || "No Supplier"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Missing Product Banner */}
              {searchTerm.trim().length > 0 && searchResults.length === 0 && (
                <div className="mt-2.5 p-3 bg-amber-50/70 rounded-lg border border-amber-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-amber-800">
                    <Package size={16} className="text-amber-600 shrink-0" />
                    <span className="font-medium">Product "{searchTerm}" not found.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProduct({
                        ...newProduct,
                        name: isNaN(Number(searchTerm)) ? searchTerm : "",
                        material_code: searchTerm,
                        barcode: searchTerm,
                        supplier_id: Number(invoiceData.supplier_id),
                      });
                      setShowAddProductModal(true);
                      setSearchTerm("");
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition shadow-sm shrink-0"
                  >
                    Register New Product
                  </button>
                </div>
              )}
            </div>

            {/* Batch Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-3 py-3 text-center">Batch Volume</th>
                      <th className="px-3 py-3 text-center">Total Units</th>
                      <th className="px-3 py-3 text-center">Free Qty</th>
                      <th className="px-3 py-3 text-right">Net Price</th>
                      <th className="px-3 py-3 text-right">Retail Price</th>
                      <th className="px-4 py-3 text-right">Line Total</th>
                      <th className="px-3 py-3 text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchItems.map((item) => (
                      <tr key={item.temp_id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-slate-800">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.barcode || item.material_code}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600 font-mono text-[11px]">
                          {item.no_cases} × {item.pack_size}
                          {item.extra_units > 0 && (
                            <span className="text-blue-600 font-semibold ml-1">+{item.extra_units}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                          {item.qty}
                        </td>
                        <td className="px-3 py-2.5 text-center text-emerald-600 font-semibold">
                          {item.free_qty > 0 ? item.free_qty : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                          Rs. {Number(item.netprice).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                          Rs. {Number(item.retail_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                          Rs. {((item.qty - (item.free_qty || 0)) * item.netprice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition rounded"
                              title="Edit item"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.temp_id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {batchItems.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Package size={28} className="mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold">No items added yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the search bar above to scan or add products</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Batch Entry / Stocking Details */}
      {activeProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-800">{activeProduct.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Code: {activeProduct.barcode || activeProduct.material_code}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveProduct(null);
                  setEditingItemId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="p-5 space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. of Cases</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    autoFocus
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={batchForm.no_cases}
                    onKeyDown={handleBatchFormKeyDown}
                    onChange={(e) => setBatchForm({ ...batchForm, no_cases: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pack Size</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={batchForm.pack_size}
                    onKeyDown={handleBatchFormKeyDown}
                    onChange={(e) => setBatchForm({ ...batchForm, pack_size: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Extra Units</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={batchForm.extra_units}
                    onKeyDown={handleBatchFormKeyDown}
                    onChange={(e) => setBatchForm({ ...batchForm, extra_units: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Free Qty (Bonus)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={batchForm.free_qty}
                  onKeyDown={handleBatchFormKeyDown}
                  onChange={(e) => setBatchForm({ ...batchForm, free_qty: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Net Cost (Rs.) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold"
                    value={batchForm.net_price}
                    onKeyDown={handleBatchFormKeyDown}
                    onChange={(e) => setBatchForm({ ...batchForm, net_price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Retail Price (Rs.) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold"
                    value={batchForm.retail_price}
                    onKeyDown={handleBatchFormKeyDown}
                    onChange={(e) => setBatchForm({ ...batchForm, retail_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={batchForm.expiry_date}
                  onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProduct(null);
                    setEditingItemId(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {editingItemId ? "Update Item" : "Add to Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm & Verification Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 border border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Invoice Total Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and verify entered totals for invoice <b>#{invoiceData.invoice_no}</b>
              </p>
            </div>

            {/* Verification Comparison Box */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Entered Target Amount:</span>
                <span className="font-bold text-slate-800">
                  Rs. {Number(originalInvoiceTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Calculated Items Total:</span>
                <span className="font-bold text-slate-800">
                  Rs. {getItemsTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Total Batches:</span>
                <span className="font-semibold text-slate-700">{batchItems.length} item(s)</span>
              </div>

              {/* Status Badge */}
              <div className="pt-1">
                {isTotalMatched ? (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>✓ Totals Match Exactly — Ready for Final Verification</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2 text-amber-800 text-xs font-medium">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>
                      Difference of <b>Rs. {Math.abs(originalInvoiceTotal - getItemsTotal()).toFixed(2)}</b> detected.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmSave(false)}
                className="py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleCompleteSupply}
                disabled={loading}
                className="py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? "Saving..." : "Verify & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Success Verification Modal */}
      {showSuccessModal && savedInvoiceSummary && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-sm">
              <CheckCircle2 size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Supply Successfully Verified!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Invoice record and incoming inventory batches have been saved.
            </p>

            {/* Invoice Confirmation Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-bold text-blue-600">#{savedInvoiceSummary.invoice_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-800">{savedInvoiceSummary.supplier_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Batches Stocked:</span>
                <span className="font-semibold text-slate-800">{savedInvoiceSummary.items_count} batch(es)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">Total Verified Amount:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  Rs. {Number(savedInvoiceSummary.items_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                New Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  navigate("/supply-invoices", { state: { activeTab: "supply" } });
                }}
                className="py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>View Invoices</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Discard Session?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Any unsaved changes for invoice <b>#{invoiceData.invoice_no}</b> will be lost.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                className="py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Keep Entry
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Register New Product</h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Material / Barcode Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={newProduct.material_code}
                  onChange={(e) => setNewProduct({ ...newProduct, material_code: e.target.value, barcode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Supplier <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={newProduct.supplier_id}
                  onChange={(e) => setNewProduct({ ...newProduct, supplier_id: Number(e.target.value) })}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSupply;
