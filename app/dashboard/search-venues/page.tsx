"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, MapPin, Users, Star, Loader2, IndianRupee, ExternalLink, CheckCircle, Globe } from "lucide-react"

type Venue = {
  name: string
  location: string
  type: string
  capacity: string
  priceRange: string
  rating: number
  features: string[]
  bestFor: string
  contact: string
  imageKeyword?: string
  imageQuery?: string
  description?: string
  amenities?: string[]
  venueHighlights?: string[]
}

const venueImages: Record<string, string[]> = {
  palace: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=400&fit=crop",
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
  ],
  resort: [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop",
  ],
  garden: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&h=400&fit=crop",
  ],
  beach: [
    "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
  ],
  banquet: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop",
  ],
  default: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop",
  ],
}

export default function SearchVenuesPage() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch("/api/search-venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location }),
      })

      const data = await response.json()
      setVenues(data.venues || [])
    } catch (error) {
      console.error("Search error:", error)
      setVenues([])
    } finally {
      setIsSearching(false)
    }
  }

  const popularSearches = [
    "Luxury palace wedding India",
    "Beach resort wedding Goa",
    "5-star hotel wedding Delhi",
    "Heritage haveli Rajasthan",
    "Garden wedding venue Bangalore",
    "Destination wedding Udaipur",
  ]

  const getVenueImage = (venue: Venue, index = 0) => {
    const type = venue.type?.toLowerCase() || ""
    let category = "default"

    if (type.includes("palace") || type.includes("heritage") || type.includes("haveli")) {
      category = "palace"
    } else if (type.includes("hotel")) {
      category = "hotel"
    } else if (type.includes("resort")) {
      category = "resort"
    } else if (type.includes("garden") || type.includes("lawn") || type.includes("farmhouse")) {
      category = "garden"
    } else if (type.includes("beach")) {
      category = "beach"
    } else if (type.includes("banquet") || type.includes("hall")) {
      category = "banquet"
    }

    const images = venueImages[category]
    return images[index % images.length]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Venues</h1>
        <p className="text-muted-foreground">
          Find wedding venues with AI-powered search - All prices in Indian Rupees (₹)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI Venue Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search venues (e.g., 'luxury palace wedding Udaipur', '5-star hotel Mumbai')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.map((term) => (
              <Badge
                key={term}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => {
                  setQuery(term)
                  setTimeout(() => handleSearch(), 100)
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Searching venues with AI...</span>
        </div>
      )}

      {!isSearching && hasSearched && venues.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No venues found. Try a different search term.</p>
          </CardContent>
        </Card>
      )}

      {!isSearching && venues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative overflow-hidden bg-muted">
                <img
                  src={getVenueImage(venue, index) || "/placeholder.svg"}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = venueImages.default[0]
                  }}
                />
                <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">{venue.type}</Badge>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{venue.name}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {venue.location}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {venue.capacity}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <IndianRupee className="h-3 w-3" />
                    {venue.priceRange.replace(/₹/g, "")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {venue.features.slice(0, 3).map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  <strong>Best for:</strong> {venue.bestFor}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    size="sm"
                    onClick={() => setSelectedVenue(venue)}
                  >
                    View Details
                  </Button>
                  {venue.contact && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={venue.contact.startsWith("http") ? venue.contact : `https://${venue.contact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedVenue} onOpenChange={() => setSelectedVenue(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedVenue && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedVenue.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="h-64 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={getVenueImage(selectedVenue, venues.indexOf(selectedVenue)) || "/placeholder.svg"}
                    alt={selectedVenue.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = venueImages.default[0]
                    }}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVenue.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVenue.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{selectedVenue.rating} / 5 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{selectedVenue.priceRange}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedVenue.description && (
                  <div>
                    <h4 className="font-semibold mb-2">About This Venue</h4>
                    <p className="text-muted-foreground">{selectedVenue.description}</p>
                  </div>
                )}

                {/* Best For */}
                <div>
                  <h4 className="font-semibold mb-2">Best For</h4>
                  <p className="text-muted-foreground">{selectedVenue.bestFor}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVenue.features.map((feature, i) => (
                      <Badge key={i} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVenue.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {selectedVenue.venueHighlights && selectedVenue.venueHighlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Venue Highlights</h4>
                    <div className="space-y-2">
                      {selectedVenue.venueHighlights.map((highlight, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {selectedVenue.contact && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Contact Venue</h4>
                    <Button asChild className="w-full">
                      <a
                        href={
                          selectedVenue.contact.startsWith("http")
                            ? selectedVenue.contact
                            : `https://${selectedVenue.contact}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
