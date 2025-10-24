'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Map } from '@/components/ui/map'
import { 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Clock,
  DollarSign,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeliveryZone {
  id: string
  name: string
  description?: string
  centerLat: number
  centerLon: number
  radius: number // in kilometers
  deliveryTime: number // in minutes
  deliveryFee: number // in ETB
  minOrderAmount: number // in ETB
  isActive: boolean
  color: string
}

interface DeliveryZonesProps {
  merchantId: string
  onZonesChange?: (zones: DeliveryZone[]) => void
  className?: string
}

const ZONE_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
]

export function DeliveryZones({ merchantId, onZonesChange, className }: DeliveryZonesProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lon: number } | null>(null)

  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    radius: 5,
    deliveryTime: 30,
    deliveryFee: 50,
    minOrderAmount: 100,
    isActive: true
  })

  // Load zones from API
  useEffect(() => {
    // In a real app, this would fetch from the API
    const mockZones: DeliveryZone[] = [
      {
        id: '1',
        name: 'Central Addis Ababa',
        description: 'Main city center delivery zone',
        centerLat: 9.0192,
        centerLon: 38.7525,
        radius: 5,
        deliveryTime: 30,
        deliveryFee: 50,
        minOrderAmount: 100,
        isActive: true,
        color: ZONE_COLORS[0]
      },
      {
        id: '2',
        name: 'Bole Area',
        description: 'Bole and surrounding areas',
        centerLat: 8.9806,
        centerLon: 38.7578,
        radius: 3,
        deliveryTime: 45,
        deliveryFee: 75,
        minOrderAmount: 150,
        isActive: true,
        color: ZONE_COLORS[1]
      }
    ]
    setZones(mockZones)
  }, [merchantId])

  const handleCreateZone = () => {
    if (!selectedCenter || !newZone.name.trim()) return

    const zone: DeliveryZone = {
      id: Date.now().toString(),
      ...newZone,
      centerLat: selectedCenter.lat,
      centerLon: selectedCenter.lon,
      color: ZONE_COLORS[zones.length % ZONE_COLORS.length]
    }

    const updatedZones = [...zones, zone]
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
    
    // Reset form
    setNewZone({
      name: '',
      description: '',
      radius: 5,
      deliveryTime: 30,
      deliveryFee: 50,
      minOrderAmount: 100,
      isActive: true
    })
    setSelectedCenter(null)
    setIsCreating(false)
  }

  const handleUpdateZone = () => {
    if (!editingZone || !selectedCenter) return

    const updatedZone = {
      ...editingZone,
      ...newZone,
      centerLat: selectedCenter.lat,
      centerLon: selectedCenter.lon
    }

    const updatedZones = zones.map(z => z.id === editingZone.id ? updatedZone : z)
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
    
    setEditingZone(null)
    setSelectedCenter(null)
    setIsCreating(false)
  }

  const handleDeleteZone = (zoneId: string) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      const updatedZones = zones.filter(z => z.id !== zoneId)
      setZones(updatedZones)
      onZonesChange?.(updatedZones)
    }
  }

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setNewZone({
      name: zone.name,
      description: zone.description || '',
      radius: zone.radius,
      deliveryTime: zone.deliveryTime,
      deliveryFee: zone.deliveryFee,
      minOrderAmount: zone.minOrderAmount,
      isActive: zone.isActive
    })
    setSelectedCenter({ lat: zone.centerLat, lon: zone.centerLon })
    setIsCreating(true)
  }

  const handleMapLocationSelect = (lat: number, lon: number) => {
    setSelectedCenter({ lat, lon })
  }

  const cancelEdit = () => {
    setEditingZone(null)
    setSelectedCenter(null)
    setIsCreating(false)
    setNewZone({
      name: '',
      description: '',
      radius: 5,
      deliveryTime: 30,
      deliveryFee: 50,
      minOrderAmount: 100,
      isActive: true
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Delivery Zones</h3>
          <p className="text-sm text-muted-foreground">
            Manage your delivery areas and pricing
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {/* Zone Creation/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingZone ? 'Edit Delivery Zone' : 'Create New Delivery Zone'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone Name *</Label>
                <Input
                  id="zoneName"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Central Addis Ababa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneRadius">Radius (km) *</Label>
                <Input
                  id="zoneRadius"
                  type="number"
                  min="1"
                  max="50"
                  value={newZone.radius}
                  onChange={(e) => setNewZone(prev => ({ ...prev, radius: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneDescription">Description</Label>
              <Input
                id="zoneDescription"
                value={newZone.description}
                onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this zone"
              />
            </div>

            {/* Pricing & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time (min)</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  min="15"
                  max="180"
                  value={newZone.deliveryTime}
                  onChange={(e) => setNewZone(prev => ({ ...prev, deliveryTime: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee (ETB)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  value={newZone.deliveryFee}
                  onChange={(e) => setNewZone(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Min Order (ETB)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  value={newZone.minOrderAmount}
                  onChange={(e) => setNewZone(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Map Selection */}
            <div className="space-y-4">
              <Label>Zone Center Location</Label>
              <Map
                lat={selectedCenter?.lat}
                lon={selectedCenter?.lon}
                onLocationSelect={handleMapLocationSelect}
                height="300px"
              />
              {selectedCenter && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Center: {selectedCenter.lat.toFixed(6)}, {selectedCenter.lon.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={editingZone ? handleUpdateZone : handleCreateZone}
                disabled={!selectedCenter || !newZone.name.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zones List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <Card key={zone.id} className={cn('relative', !zone.isActive && 'opacity-60')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{zone.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={zone.isActive ? "default" : "secondary"}>
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                </div>
              </div>
              {zone.description && (
                <p className="text-sm text-muted-foreground">{zone.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Zone Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{zone.radius}km radius</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{zone.deliveryTime}min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span>{zone.deliveryFee} ETB</span>
                </div>
                <div className="text-muted-foreground">
                  Min: {zone.minOrderAmount} ETB
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditZone(zone)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteZone(zone.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zones.length === 0 && !isCreating && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Delivery Zones</h3>
            <p className="text-muted-foreground mb-4">
              Create your first delivery zone to start accepting orders
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Zone
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

