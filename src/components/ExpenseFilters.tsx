
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface ExpenseFiltersProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string | null) => void;
  onAmountRangeFilter: (min: number | null, max: number | null) => void;
  onCurrencyFilter: (currency: string | null) => void;
  searchQuery: string;
  selectedCategory: string | null;
  selectedCurrency: string | null;
  amountRange: { min: number | null; max: number | null };
  onClearFilters: () => void;
}

const categories = [
  "Recurring", "Food", "Work Food", "External Food", "Transport", 
  "Holiday", "Utilities", "Software", "Marketing", "Office"
];

const currencies = ["USD", "EUR", "RSD"];

export const ExpenseFilters = ({
  onSearch,
  onCategoryFilter,
  onAmountRangeFilter,
  onCurrencyFilter,
  searchQuery,
  selectedCategory,
  selectedCurrency,
  amountRange,
  onClearFilters
}: ExpenseFiltersProps) => {
  const [minAmount, setMinAmount] = useState(amountRange.min?.toString() || "");
  const [maxAmount, setMaxAmount] = useState(amountRange.max?.toString() || "");

  const handleAmountFilter = () => {
    const min = minAmount ? parseFloat(minAmount) : null;
    const max = maxAmount ? parseFloat(maxAmount) : null;
    onAmountRangeFilter(min, max);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      onCategoryFilter(null);
    } else {
      onCategoryFilter(value);
    }
  };

  const handleCurrencyChange = (value: string) => {
    if (value === "all") {
      onCurrencyFilter(null);
    } else {
      onCurrencyFilter(value);
    }
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCurrency || amountRange.min || amountRange.max;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Currency Filter */}
        <Select value={selectedCurrency || "all"} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All currencies</SelectItem>
            {currencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Amount Range */}
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            onBlur={handleAmountFilter}
            className="h-9"
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            onBlur={handleAmountFilter}
            className="h-9"
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Search: {searchQuery}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onSearch("")} />
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              Category: {selectedCategory}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onCategoryFilter(null)} />
            </Badge>
          )}
          {selectedCurrency && (
            <Badge variant="secondary" className="text-xs">
              Currency: {selectedCurrency}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onCurrencyFilter(null)} />
            </Badge>
          )}
          {(amountRange.min || amountRange.max) && (
            <Badge variant="secondary" className="text-xs">
              Amount: {amountRange.min || 0} - {amountRange.max || "∞"}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onAmountRangeFilter(null, null)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
