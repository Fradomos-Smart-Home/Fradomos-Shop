import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FilterOptions } from '@/types/product';
import StarRating from '@/components/ui/star-rating';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
}

const FilterSidebar = ({ filters, onFiltersChange, categories }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState(filters.priceRange);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyPriceRange = () => {
    onFiltersChange({ ...filters, priceRange });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating });
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      priceRange: [0, 2000],
      minRating: 0,
      inStockOnly: false,
    };
    setPriceRange(defaultFilters.priceRange);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="filter-section">
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.slice(1).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <label 
                  htmlFor={category} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="filter-section">
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={applyPriceRange}
              className="w-full"
            >
              Apply Price Filter
            </Button>
          </div>
        </div>

        <Separator />

        {/* Rating */}
        <div className="filter-section">
          <h3 className="font-medium mb-3">Minimum Rating</h3>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <div 
                key={rating} 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleRatingChange(rating)}
              >
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.minRating === rating}
                />
                <label 
                  htmlFor={`rating-${rating}`} 
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <StarRating rating={rating} size="sm" />
                  <span>& Up</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stock Status */}
        <div className="filter-section">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStockOnly}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, inStockOnly: checked as boolean })
              }
            />
            <label 
              htmlFor="in-stock" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              In Stock Only
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;