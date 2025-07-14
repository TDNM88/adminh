"use client"

import React, { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
}

interface SearchFilterProps {
  placeholder?: string
  onSearch: (value: string) => void
  filterOptions?: FilterOption[]
  selectedFilter?: string
  onFilterChange?: (filterId: string) => void
  className?: string
  initialValue?: string
}

export function SearchFilter({
  placeholder = "Tìm kiếm...",
  onSearch,
  filterOptions,
  selectedFilter,
  onFilterChange,
  className,
  initialValue = "",
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const hasFilters = filterOptions && filterOptions.length > 0

  const handleSearch = () => {
    onSearch(searchValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearchValue("")
    onSearch("")
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-8"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-8 top-0 h-full"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {hasFilters && onFilterChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              {filterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedFilter === option.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onFilterChange(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
