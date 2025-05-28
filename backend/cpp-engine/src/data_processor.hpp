#ifndef DATA_PROCESSOR_HPP
#define DATA_PROCESSOR_HPP

#include <vector>
#include <memory>
#include <string>
#include <unordered_map>

namespace houston_oil_airs {

struct ResearchDataPoint {
    double x, y, z;
    double confidence;
    std::string category;
    double timestamp;
    std::vector<double> metadata;
};

struct NetworkNode {
    std::string id;
    std::string label;
    std::vector<std::string> connections;
    double influence_score;
    std::unordered_map<std::string, double> attributes;
};

class DataProcessor {
private:
    std::vector<ResearchDataPoint> research_data_;
    std::vector<NetworkNode> network_nodes_;
    
    void optimizeDataStructures();
    void calculateInfluenceMetrics();

public:
    DataProcessor();
    ~DataProcessor();
    
    // High-performance data processing
    void loadResearchData(const std::string& filepath);
    void processAIMetrics(const std::vector<double>& raw_metrics);
    
    // Optimized data retrieval for visualization
    std::vector<ResearchDataPoint> getFilteredData(
        const std::string& category,
        double min_confidence = 0.0,
        size_t max_points = 10000
    ) const;
    
    std::vector<NetworkNode> getNetworkTopology(
        double min_influence = 0.1
    ) const;
    
    // Real-time data streaming
    void updateDataPoint(const ResearchDataPoint& point);
    std::string serializeForWebGL() const;
    
    // Performance optimization
    void enableSpatialIndexing();
    void clearCache();
};

// Utility functions for web interface
extern "C" {
    DataProcessor* create_processor();
    void destroy_processor(DataProcessor* processor);
    const char* get_visualization_data(DataProcessor* processor, const char* category);
    void update_real_time_data(DataProcessor* processor, double* values, int count);
}

} // namespace houston_oil_airs

#endif