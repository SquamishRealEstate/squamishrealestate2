import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/lib/mockData";


export default function FeaturedProperties() {
    return (
        <section id="properties" className="py-20 bg-muted/20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Discover our handpicked selection of exceptional homes
              </p>
            </div>
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockListings.slice(0, 6).map((property) => (
              <ListingCard key={property.id} listing={property} />
            ))}
          </div>
        </div>
      </section>
    )
}