import { Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const Suppliers = () => {
  const [showcreatemodel,setshowcreatemodel]=useState(false)
  const [formdata,setformData]=useState({
    name:"",
    contactno:"",
    address:""
})


const handleFormSubmit= async(e)=>{
  e.preventDefault()
  const res=await axios.post(`${apiBaseUrl}/api/suppliers`, formdata)
  console.log(res)

}
  return (
    <div className='flex flex-col gap-6 p-4 sm:p-6 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <div className='text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Suppliers</div>
        <div className='text-sm text-slate-500 sm:text-base'>Manage supplier contacts, addresses, and registration details.</div>
      </div>

      <button
        type='button'
        className='inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0'
        onClick={() => {
        setshowcreatemodel(true)
      }}
      >
        <Plus size={18} />
        New Supplier
      </button>

      {
        showcreatemodel && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm'>
            <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200'>
              <div className='flex items-start justify-between border-b border-slate-200 px-6 py-5 sm:px-8'>
                <div>
                  <div className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>New Supplier</div>
                  <div className='mt-1 text-2xl font-bold text-slate-900'>Resgiser New Supplier</div>
                  
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
                      placeholder='Hemas Pharmaceuticals'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      onChange={(e)=>
                        setformData({...formdata,name:e.target.value})
                      }
                    />
                  </label>

                  <label className='flex flex-col gap-2 sm:col-span-1'>
                    <span className='text-sm font-semibold text-slate-700'>Contact Number</span>
                    <input
                    name='contactno'
                      type='tel'
                      placeholder='0768987589'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                       onChange={(e)=>
                        setformData({...formdata,contactno:e.target.value})
                      }
                    />
                  </label>

                  <label className='flex flex-col gap-2 sm:col-span-2'>
                    <span className='text-sm font-semibold text-slate-700'>Business Address</span>
                    <textarea
                    name='address'
                      rows='4'
                      placeholder='Full address'
                      className='rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'
                       onChange={(e)=>
                        setformData({...formdata,address:e.target.value})
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
                    className='rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500'
                  >
                    Register Supplier
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
