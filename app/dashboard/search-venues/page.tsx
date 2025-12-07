"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Users, Star, Loader2, IndianRupee } from "lucide-react"

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
}

export default function SearchVenuesPage() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])
  const [hasSearched, setHasSearched] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Venues</h1>
        <p className="text-muted-foreground">Find wedding venues across India with AI-powered search</p>
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
                placeholder="Search venues (e.g., 'luxury beach wedding venue', 'budget hotel banquet')"
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
            {["Luxury resorts Udaipur", "Beach venues Goa", "Banquet halls Mumbai", "Palace weddings Jaipur"].map(
              (term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setQuery(term)
                    handleSearch()
                  }}
                >
                  {term}
                </Badge>
              ),
            )}
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
            <Card key={index} className="overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-4xl">🏛️</span>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{venue.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {venue.location}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{venue.type}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {venue.capacity}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium text-primary mb-3">
                  <IndianRupee className="h-3 w-3" />
                  {venue.priceRange}
                </div>

                <div className="space-y-1 mb-3">
                  {venue.features.slice(0, 3).map((feature, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      • {feature}
                    </p>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  <strong>Best for:</strong> {venue.bestFor}
                </p>

                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
