'use client'

import Image from 'next/image'
import { getVehicleIconPath } from '@/lib/constants/vehicle-icons'

interface VehicleIconProps {
    brand?: string
    size?: number
    className?: string
    alt?: string
}

export function VehicleIcon({
    brand,
    size = 32,
    className = '',
    alt
}: VehicleIconProps) {
    const iconPath = getVehicleIconPath(brand)
    const altText = alt || brand || 'Araç'

    return (
        <div
            className={`relative flex-shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={iconPath}
                alt={altText}
                width={size}
                height={size}
                className="object-contain"
                unoptimized
                onError={(e) => {
                    // Fallback to default icon
                    const target = e.target as HTMLImageElement
                    target.src = '/vehicles/brands/default.png'
                }}
            />
        </div>
    )
}
