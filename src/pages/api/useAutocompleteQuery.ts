import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useAutocompleteQuery = (query: string) => {
    return useQuery({
      queryKey: ['autocomplete', query],
      queryFn: async () => {
        if (!query.trim()) return [];
        
        const response = await axios.get(
          `https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${query}`
        );
        
        // Add some dummy data if the API doesn't return enough results
        const dummyData = [
          { id: 'rev1', name: 'Revenue', value: 5000, type: 'variable' },
          { id: 'cost1', name: 'Cost', value: 3000, type: 'variable' },
          { id: 'profit1', name: 'Profit', value: 2000, type: 'variable' },
          { id: 'growth1', name: 'Growth Rate', value: 0.15, type: 'variable' },
          { id: 'sum1', name: 'SUM', value: 0, type: 'function' },
          { id: 'avg1', name: 'AVERAGE', value: 0, type: 'function' }
        ];
        
        // Filter dummy data based on query
        const filteredDummy = dummyData.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        // Combine API results with dummy data
        const combined = [...response.data, ...filteredDummy];
        
        // Remove duplicates
        const uniqueResults = combined.filter((item, index, self) =>
          index === self.findIndex(t => t.name === item.name)
        );
        
        return uniqueResults.slice(0, 10); // Limit to 10 results
      },
      enabled: query.length > 0,
      staleTime: 60000 // 1 minute
    });
  };
  