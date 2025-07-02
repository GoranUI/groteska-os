import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Receipt, Edit, Trash2 } from "lucide-react";
import { Expense } from "@/types";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseBulkActions } from "./ExpenseBulkActions";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

type FilterPeriod = "week" | "2weeks" | "month" | "quarter" | "year" | "lastyear" | "all";

export const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [amountRange, setAmountRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Recurring': 'bg-violet-100 text-violet-800 border-violet-200',
      'Food': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Work Food': 'bg-amber-100 text-amber-800 border-amber-200',
      'External Food': 'bg-purple-100 text-purple-800 border-purple-200',
      'Transport': 'bg-blue-100 text-blue-800 border-blue-200',
      'Holiday': 'bg-pink-100 text-pink-800 border-pink-200',
      'Utilities': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Software': 'bg-orange-100 text-orange-800 border-orange-200',
      'Marketing': 'bg-red-100 text-red-800 border-red-200',
      'Office': 'bg-slate-100 text-slate-800 border-slate-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Time period filter
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterPeriod) {
      case "week": {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo);
        break;
      }
      case "2weeks": {
        const twoWeeksAgo = new Date(startOfToday);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        filtered = filtered.filter(expense => new Date(expense.date) >= twoWeeksAgo);
        break;
      }
      case "month": {
        const monthAgo = new Date(startOfToday);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(expense => new Date(expense.date) >= monthAgo);
        break;
      }
      case "quarter": {
        const quarterAgo = new Date(startOfToday);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        filtered = filtered.filter(expense => new Date(expense.date) >= quarterAgo);
        break;
      }
      case "year": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(expense => new Date(expense.date) >= yearStart);
        break;
      }
      case "lastyear": {
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= lastYearStart && expenseDate <= lastYearEnd;
        });
        break;
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Currency filter
    if (selectedCurrency) {
      filtered = filtered.filter(expense => expense.currency === selectedCurrency);
    }

    // Amount range filter
    if (amountRange.min !== null || amountRange.max !== null) {
      filtered = filtered.filter(expense => {
        const amount = expense.amount;
        const minMatch = amountRange.min === null || amount >= amountRange.min;
        const maxMatch = amountRange.max === null || amount <= amountRange.max;
        return minMatch && maxMatch;
      });
    }

    return filtered;
  }, [expenses, filterPeriod, searchQuery, selectedCategory, selectedCurrency, amountRange]);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterPeriod(value as FilterPeriod);
    setCurrentPage(1);
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    const newSelected = new Set(selectedExpenses);
    if (checked) {
      newSelected.add(expenseId);
    } else {
      newSelected.delete(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(new Set(paginatedExpenses.map(expense => expense.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  const handleBulkDelete = () => {
    selectedExpenses.forEach(id => onDelete(id));
    setSelectedExpenses(new Set());
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedCurrency(null);
    setAmountRange({ min: null, max: null });
    setCurrentPage(1);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ExpenseFilters
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        onAmountRangeFilter={(min, max) => setAmountRange({ min, max })}
        onCurrencyFilter={setSelectedCurrency}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedCurrency={selectedCurrency}
        amountRange={amountRange}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      <ExpenseBulkActions
        selectedCount={selectedExpenses.size}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedExpenses(new Set())}
      />

      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Expense History</CardTitle>
                <p className="text-sm text-gray-600">
                  {filteredExpenses.length} entries
                  {selectedExpenses.size > 0 && ` • ${selectedExpenses.size} selected`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={filterPeriod} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="2weeks">Last 2 weeks</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600">No expenses match the selected filters</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedExpenses.size === paginatedExpenses.length && paginatedExpenses.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Description</TableHead>
                      <TableHead className="font-semibold text-gray-900">Category</TableHead>
                      <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedExpenses.has(expense.id)}
                            onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-700 max-w-xs truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getCategoryColor(expense.category)} border font-medium`}>
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-300 text-gray-700 font-medium">
                            {expense.currency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost-edit"
                              size="action-icon"
                              onClick={() => onEdit(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost-delete"
                              size="action-icon"
                              onClick={() => onDelete(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Footer */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
