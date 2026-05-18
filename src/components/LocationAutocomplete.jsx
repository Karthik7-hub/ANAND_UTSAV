import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import '../css/LocationAutocomplete.css';

export default function LocationAutocomplete({ 
  value, 
  onLocationSelect, 
  placeholder = "Search for city, neighborhood...", 
  className = "",
  style = {},
  required = false
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync prop value to local state if it changes externally
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error("Failed to fetch location suggestions", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // If the user clears the input, clear the location in parent
    if (e.target.value.trim() === "") {
        onLocationSelect({ name: "", lat: "", lng: "" });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Determine a cleaner name from display_name
    const parts = suggestion.display_name.split(',');
    const cleanName = parts.length > 0 ? parts[0].trim() + (parts.length > 1 ? ', ' + parts[1].trim() : '') : suggestion.display_name;
    
    setQuery(cleanName);
    setIsDropdownOpen(false);
    
    onLocationSelect({
      name: cleanName,
      lat: Number(suggestion.lat),
      lng: Number(suggestion.lon)
    });
  };

  return (
    <div className={`location-autocomplete-container ${className}`} style={style} ref={dropdownRef}>
      <div className="location-input-wrapper">
        <MapPin className="location-input-icon" size={18} />
        <input 
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          onFocus={() => { if(suggestions.length > 0) setIsDropdownOpen(true); }}
          placeholder={placeholder}
          className="location-autocomplete-input"
          required={required}
        />
        {isLoading && <Loader2 className="location-loading-icon spin" size={16} />}
      </div>
      
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="location-suggestions-list">
          {suggestions.map((item, index) => (
            <li key={item.place_id || index} onClick={() => handleSuggestionClick(item)}>
              <MapPin size={14} className="suggestion-icon" />
              <span className="suggestion-text">{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
