"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Plus, Trash2, Trophy, MapPin, Users, Star, Calendar } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const availableVenues = [
  {
    id: "1",
    name: "Grand Ballroom",
    venue: "The Grand Hotel",
    image: "/luxury-grand-ballroom-wedding-venue-with-chandelie.jpg",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Garden Pavilion",
    venue: "Rose Estate",
    image: "/beautiful-outdoor-garden-wedding-venue-with-flower.jpg",
    location: "Bangalore, Karnataka",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Rooftop Terrace",
    venue: "Sky Lounge",
    image: "/modern-rooftop-terrace-wedding-venue-city-skyline.jpg",
    location: "Delhi NCR",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Lakeside Manor",
    venue: "Lake View Resort",
    image: "/elegant-lakeside-manor-wedding-venue-with-water-vi.jpg",
    location: "Udaipur, Rajasthan",
    rating: 4.9,
  },
  {
    id: "5",
    name: "Beach Paradise",
    venue: "Coastal Resort",
    image: "/tropical-beach-wedding-venue-with-palm-trees-and-o.jpg",
    location: "Goa",
    rating: 4.5,
  },
]

const venueDetails: Record<
  string,
  {
    name: string
    venue: string
    image: string
    location: string
    rating: number
    basePrice: number
    hiddenFees: number
    totalPrice: number
    riskScore: number
    capacity: number
    cancellation: string
    cancellationRisk: "high" | "medium" | "low"
    includedServices: string[]
    notIncluded: string[]
    pros: string[]
    cons: string[]
    amenities: string[]
    availability: string
  }
> = {
  "1": {
    name: "Grand Ballroom",
    venue: "The Grand Hotel",
    image: "/luxury-grand-ballroom-wedding-venue-with-chandelie.jpg",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    basePrice: 1500000,
    hiddenFees: 245000,
    totalPrice: 1850000,
    riskScore: 7.5,
    capacity: 250,
    cancellation: "100% within 90 days",
    cancellationRisk: "high",
    includedServices: ["Tables & Chairs", "Venue Coordinator", "Setup/Breakdown", "Valet Parking", "Bridal Suite"],
    notIncluded: ["Catering", "Bar Service", "DJ", "Decor", "Photography"],
    pros: ["Stunning architecture", "Experienced staff", "Central location", "5-star service"],
    cons: ["High service charge (18%)", "Strict cancellation", "Limited vendor options"],
    amenities: ["AC", "Parking", "WiFi", "Bridal Room", "Green Room"],
    availability: "Available: Jan, Feb, Mar 2026",
  },
  "2": {
    name: "Garden Pavilion",
    venue: "Rose Estate",
    image: "/beautiful-outdoor-garden-wedding-venue-with-rose-g.jpg",
    location: "Bangalore, Karnataka",
    rating: 4.6,
    basePrice: 1200000,
    hiddenFees: 98000,
    totalPrice: 1350000,
    riskScore: 4.2,
    capacity: 200,
    cancellation: "50% within 60 days",
    cancellationRisk: "medium",
    includedServices: ["Tables & Chairs", "Setup/Breakdown", "Garden access", "Bridal Suite", "Basic Lighting"],
    notIncluded: ["Catering", "Coordinator", "Parking"],
    pros: ["Flexible vendors", "Beautiful gardens", "Reasonable fees", "Natural backdrop"],
    cons: ["Weather dependent", "Limited parking", "No indoor backup"],
    amenities: ["Gardens", "Outdoor Seating", "Photo Spots", "Lawn Area"],
    availability: "Available: Dec 2025 - Apr 2026",
  },
  "3": {
    name: "Rooftop Terrace",
    venue: "Sky Lounge",
    image: "/modern-rooftop-terrace-wedding-venue-with-city-sky.jpg",
    location: "Delhi NCR",
    rating: 4.7,
    basePrice: 1800000,
    hiddenFees: 120000,
    totalPrice: 2050000,
    riskScore: 5.8,
    capacity: 150,
    cancellation: "Tiered refund policy",
    cancellationRisk: "low",
    includedServices: ["Tables & Chairs", "Bar Service", "City views", "A/V Equipment", "Climate Control"],
    notIncluded: ["Catering", "Decor", "DJ"],
    pros: ["Stunning city views", "Modern aesthetic", "In-house bar", "Instagram-worthy"],
    cons: ["Limited capacity", "Noise restrictions after 10pm", "Higher base price"],
    amenities: ["AC", "Bar", "Sound System", "LED Screens", "Heaters"],
    availability: "Limited slots: Feb, Mar 2026",
  },
  "4": {
    name: "Lakeside Manor",
    venue: "Lake View Resort",
    image: "/elegant-lakeside-manor-wedding-venue-with-lake-ref.jpg",
    location: "Udaipur, Rajasthan",
    rating: 4.9,
    basePrice: 2500000,
    hiddenFees: 180000,
    totalPrice: 2800000,
    riskScore: 3.5,
    capacity: 300,
    cancellation: "75% refund within 45 days",
    cancellationRisk: "low",
    includedServices: ["Full Decor", "Catering", "Coordination", "Accommodation (20 rooms)", "Transport"],
    notIncluded: ["DJ", "Photography", "Mehendi"],
    pros: ["All-inclusive package", "Royal ambiance", "Lake views", "Accommodation included"],
    cons: ["Remote location", "High minimum spend", "Advance booking required"],
    amenities: ["Lake View", "Boat Ride", "Spa", "Pool", "Heritage Rooms"],
    availability: "Booking: Oct 2026 onwards",
  },
  "5": {
    name: "Beach Paradise",
    venue: "Coastal Resort",
    image: "/tropical-beach-wedding-venue-sunset-ceremony-palm-.jpg",
    location: "Goa",
    rating: 4.5,
    basePrice: 800000,
    hiddenFees: 95000,
    totalPrice: 950000,
    riskScore: 6.0,
    capacity: 100,
    cancellation: "60% within 30 days",
    cancellationRisk: "medium",
    includedServices: ["Beach Setup", "Basic Decor", "Sound System", "Coordination"],
    notIncluded: ["Catering", "Bar", "Accommodation", "Transport"],
    pros: ["Beach ceremony", "Sunset views", "Relaxed vibe", "Budget friendly"],
    cons: ["Weather dependent", "Limited capacity", "Monsoon restrictions"],
    amenities: ["Beach Access", "Pool", "Restaurant", "Bar"],
    availability: "Nov 2025 - May 2026",
  },
}

export function VenueComparison() {
  const [selectedVenues, setSelectedVenues] = useState<string[]>(["1", "2"])
  const [showVenuePicker, setShowVenuePicker] = useState(false)

  const addVenue = (id: string) => {
    if (selectedVenues.length < 3 && !selectedVenues.includes(id)) {
      setSelectedVenues([...selectedVenues, id])
      setShowVenuePicker(false)
    }
  }

  const removeVenue = (id: string) => {
    setSelectedVenues(selectedVenues.filter((c) => c !== id))
  }

  const availableToAdd = availableVenues.filter((v) => !selectedVenues.includes(v.id))

  const venues = selectedVenues.map((id) => venueDetails[id])

  const lowestTotal = Math.min(...venues.map((c) => c.totalPrice))
  const lowestRisk = Math.min(...venues.map((c) => c.riskScore))
  const highestRating = Math.max(...venues.map((c) => c.rating))

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`
    }
    return `₹${price.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Venue Selection with Images */}
      <Card>
        <CardHeader>
          <CardTitle>Select Venues to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {availableVenues.map((venue) => {
              const isSelected = selectedVenues.includes(venue.id)
              return (
                <div
                  key={venue.id}
                  className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                  } ${!isSelected && selectedVenues.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (isSelected) {
                      removeVenue(venue.id)
                    } else if (selectedVenues.length < 3) {
                      addVenue(venue.id)
                    }
                  }}
                >
                  <div className="relative h-32">
                    <Image src={venue.image || "/placeholder.svg"} alt={venue.name} fill className="object-cover" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-card">
                    <h4 className="font-medium text-sm truncate">{venue.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{venue.venue}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{venue.location.split(",")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{venue.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Click on venues to add or remove them from comparison ({selectedVenues.length}/3 selected)
          </p>
        </CardContent>
      </Card>

      {/* Quick Comparison Cards with Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map((venue, index) => (
          <Card key={index} className="relative overflow-hidden">
            {venue.totalPrice === lowestTotal && (
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-green-600 text-white gap-1">
                  <Trophy className="h-3 w-3" />
                  Best Value
                </Badge>
              </div>
            )}
            {venue.rating === highestRating && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-yellow-600 text-white gap-1">
                  <Star className="h-3 w-3" />
                  Top Rated
                </Badge>
              </div>
            )}

            {/* Venue Image */}
            <div className="relative h-48">
              <Image src={venue.image || "/placeholder.svg"} alt={venue.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-semibold text-white text-lg">{venue.name}</h3>
                <p className="text-white/80 text-sm">{venue.venue}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  removeVenue(selectedVenues[index])
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardContent className="pt-4">
              {/* Location & Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {venue.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{venue.rating}</span>
                </div>
              </div>

              {/* Capacity & Availability */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {venue.capacity} guests
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{venue.availability.split(":")[0]}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base Price</span>
                  <span className="font-medium">{formatPrice(venue.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hidden Fees</span>
                  <span className="font-medium text-destructive">+{formatPrice(venue.hiddenFees)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-lg">{formatPrice(venue.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <Badge variant={venue.riskScore > 6 ? "destructive" : venue.riskScore > 4 ? "default" : "secondary"}>
                    {venue.riskScore}/10
                    {venue.riskScore === lowestRisk && " (Lowest)"}
                  </Badge>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Key Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {venue.amenities.slice(0, 4).map((amenity, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {venue.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{venue.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedVenues.length < 3 && (
          <Dialog open={showVenuePicker} onOpenChange={setShowVenuePicker}>
            <DialogTrigger asChild>
              <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                  <Button variant="ghost" className="flex-col h-auto py-8">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-muted-foreground">Add Venue to Compare</span>
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select a Venue to Add</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {availableToAdd.map((venue) => (
                  <div
                    key={venue.id}
                    className="relative rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-all"
                    onClick={() => addVenue(venue.id)}
                  >
                    <div className="relative h-32">
                      <Image src={venue.image || "/placeholder.svg"} alt={venue.name} fill className="object-cover" />
                    </div>
                    <div className="p-3 bg-card">
                      <h4 className="font-medium text-sm">{venue.name}</h4>
                      <p className="text-xs text-muted-foreground">{venue.venue}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{venue.location.split(",")[0]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{venue.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {availableToAdd.length === 0 && (
                  <p className="col-span-2 text-center text-muted-foreground py-8">
                    All available venues are already selected
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Feature</th>
                {venues.map((venue, index) => (
                  <th key={index} className="text-left py-3 px-4 text-sm font-medium text-foreground">
                    {venue.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Location</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4 text-sm font-medium">
                    {venue.location}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Capacity</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4 text-sm font-medium">
                    {venue.capacity} guests
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Base Price</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4 text-sm font-medium">
                    {formatPrice(venue.basePrice)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Hidden Fees</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4 text-sm font-medium text-destructive">
                    {formatPrice(venue.hiddenFees)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="py-3 px-4 text-sm font-medium">Total Price</td>
                {venues.map((venue, index) => (
                  <td
                    key={index}
                    className={`py-3 px-4 text-sm font-bold ${venue.totalPrice === lowestTotal ? "text-green-600" : ""}`}
                  >
                    {formatPrice(venue.totalPrice)}
                    {venue.totalPrice === lowestTotal && " ★"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Cost per Guest</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4 text-sm font-medium">
                    {formatPrice(Math.round(venue.totalPrice / venue.capacity))}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Cancellation Policy</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {venue.cancellationRisk === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : venue.cancellationRisk === "medium" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm">{venue.cancellation}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm text-muted-foreground">Risk Score</td>
                {venues.map((venue, index) => (
                  <td key={index} className="py-3 px-4">
                    <Badge
                      variant={venue.riskScore > 6 ? "destructive" : venue.riskScore > 4 ? "default" : "secondary"}
                    >
                      {venue.riskScore}/10
                    </Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Included Services Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Included Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <div key={index}>
                <h4 className="font-medium mb-3">{venue.name}</h4>
                <div className="space-y-2">
                  {venue.includedServices.map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{service}</span>
                    </div>
                  ))}
                  {venue.notIncluded.map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pros and Cons */}
      <Card>
        <CardHeader>
          <CardTitle>Pros & Cons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <div key={index}>
                <h4 className="font-medium mb-3">{venue.name}</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {venue.pros.map((pro, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">Cons</p>
                    <ul className="space-y-1">
                      {venue.cons.map((con, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
