/**
 * FilterBar Component - District and category filters
 */
import { useState, useEffect } from 'react';
import { utilsAPI } from '../services/api';

const CATEGORIES = ['Outdoors', 'Transport', 'Events', 'Danger', 'Announcements'];

function FilterBar({ filters, onFilterChange }) {
    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        // Fetch districts from API
        utilsAPI.getDistricts()
            .then(res => setDistricts(res.data.districts))
            .catch(err => console.error('Failed to fetch districts:', err));
    }, []);

    const handleDistrictChange = (e) => {
        onFilterChange({ ...filters, district: e.target.value || null });
    };

    const handleCategoryChange = (e) => {
        onFilterChange({ ...filters, category: e.target.value || null });
    };

    const clearFilters = () => {
        onFilterChange({ district: null, category: null });
    };

    const hasActiveFilters = filters.district || filters.category;

    return (
        <div className="filter-bar mb-4">
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={filters.district || ''}
                        onChange={handleDistrictChange}
                    >
                        <option value="">All Districts</option>
                        {districts.map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={filters.category || ''}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    {hasActiveFilters && (
                        <button
                            className="btn btn-outline-light w-100"
                            onClick={clearFilters}
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FilterBar;
