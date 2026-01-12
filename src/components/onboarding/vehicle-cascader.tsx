'use client'

import { useState, useEffect } from 'react'
import type { VehicleCatalogItem } from '@/types/vehicle-catalog'
import {
  getUniqueBrands,
  getModelsByBrand,
  getTrimsByModel,
} from '@/lib/utils/vehicle-catalog'
import vehicleData from '@/data/arabalar.json'

interface VehicleCascaderProps {
  onVehicleSelect: (vehicle: VehicleCatalogItem & { year: number }) => void
  initialVehicle?: VehicleCatalogItem & { year: number }
}

export function VehicleCascader({ onVehicleSelect, initialVehicle }: VehicleCascaderProps) {
  const catalog = vehicleData as VehicleCatalogItem[]

  const [selectedBrand, setSelectedBrand] = useState<string>(initialVehicle?.marka || '')
  const [selectedModel, setSelectedModel] = useState<string>(initialVehicle?.model || '')
  const [selectedTrim, setSelectedTrim] = useState<VehicleCatalogItem | null>(initialVehicle || null)
  const [selectedYear, setSelectedYear] = useState<number>(initialVehicle?.year || new Date().getFullYear())

  const brands = getUniqueBrands(catalog)
  const models = selectedBrand ? getModelsByBrand(catalog, selectedBrand) : []
  const trims = selectedBrand && selectedModel
    ? getTrimsByModel(catalog, selectedBrand, selectedModel)
    : []

  // Notify parent when selection is complete
  useEffect(() => {
    if (selectedTrim && selectedYear) {
      onVehicleSelect({ ...selectedTrim, year: selectedYear })
    }
  }, [selectedTrim, selectedYear, onVehicleSelect])

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedModel('')
    setSelectedTrim(null)
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setSelectedTrim(null)
  }

  const handleTrimChange = (trimId: string) => {
    const trim = trims.find(t => t.id === trimId)
    if (trim) {
      setSelectedTrim(trim)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-4">
      {/* Brand Select */}
      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-slate-300 mb-1">
          Marka *
        </label>
        <select
          id="brand"
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Marka Seçin</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Model Select */}
      {selectedBrand && (
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">
            Model *
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Model Seçin</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      )}

      {/* Trim/Donanım Select */}
      {selectedModel && (
        <div>
          <label htmlFor="trim" className="block text-sm font-medium text-slate-300 mb-1">
            Donanım Paketi *
          </label>
          <select
            id="trim"
            value={selectedTrim?.id || ''}
            onChange={(e) => handleTrimChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Donanım Seçin</option>
            {trims.map(trim => (
              <option key={trim.id} value={trim.id}>
                {trim.donanim} - {trim.motor}cc - {trim.yakit} - {trim.vites}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Year Select */}
      {selectedTrim && (
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-slate-300 mb-1">
            Model Yılı *
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Yıl Seçin</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Vehicle Summary */}
      {selectedTrim && selectedYear && (
        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Seçilen Araç:</h4>
          <p className="text-white font-semibold">
            {selectedTrim.marka} {selectedTrim.model} ({selectedYear})
          </p>
          <p className="text-sm text-slate-400">
            {selectedTrim.donanim} • {selectedTrim.motor}cc • {selectedTrim.yakit} • {selectedTrim.vites}
          </p>
        </div>
      )}
    </div>
  )
}
