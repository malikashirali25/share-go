import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  grouped?: boolean;
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({ options, value, onChange, placeholder = "Select...", searchPlaceholder = "Search...", className, grouped = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.group && option.group.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group options by their group property
    // Keep ungrouped items (like "All Locations") separate at the top
    const groupedOptions = grouped
      ? filteredOptions.reduce((acc, option) => {
          // Items without a group go to a special "" key that will be rendered first without a header
          const group = option.group || "";
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(option);
          return acc;
        }, {} as Record<string, SearchableSelectOption[]>)
      : { "": filteredOptions };
    
    // Sort the groups so empty group (ungrouped items) comes first, then alphabetical
    const sortedGroupKeys = Object.keys(groupedOptions).sort((a, b) => {
      if (a === "") return -1;
      if (b === "") return 1;
      return a.localeCompare(b);
    });

    // Get selected option label
    const selectedOption = options.find(opt => opt.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("All");
      setSearchTerm("");
    };

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
            "border border-slate-200/50 dark:border-slate-700/50",
            "text-slate-900 dark:text-slate-100 rounded-2xl",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "transition-all duration-300 hover:border-primary/30 shadow-lg hover:shadow-xl",
            "flex items-center justify-between text-left"
          )}
        >
          <span className={cn(
            "truncate",
            value === "All" ? "text-slate-500 dark:text-slate-400" : ""
          )}>
            {selectedLabel}
          </span>
          <div className="flex items-center gap-2">
            {value !== "All" && (
              <X
                className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={cn(
                "h-5 w-5 text-slate-400 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-96 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-80">
              {sortedGroupKeys.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No results found
                </div>
              ) : (
                sortedGroupKeys.map((group) => {
                  const groupOptions = groupedOptions[group];
                  return (
                    <div key={group || '_ungrouped'}>
                      {/* Only show group header if there's a group name */}
                      {grouped && group && (
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800">
                          {group}
                        </div>
                      )}
                      {groupOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          className={cn(
                            "w-full px-4 py-2.5 text-left transition-colors",
                            "text-sm text-slate-900 dark:text-slate-100",
                            "hover:bg-slate-100 dark:hover:bg-slate-800",
                            value === option.value && "bg-slate-100 dark:bg-slate-800 font-medium"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };

