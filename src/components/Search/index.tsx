import React from "react";
import SearchFilters from "./SearchFilters";
import ListingCard from "../ListingCard";

export default function Search() {
    return (
      <section 
        className="relative bg-background py-10"
        style={{
          clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
          marginTop: "-5rem",
          paddingTop: "8rem"
        }}
      >
        <SearchFilters />
        
      </section>
    );
}