cmake_minimum_required(VERSION 3.10)
project(CppEngine)

set(CMAKE_CXX_STANDARD 17)

add_library(data_processor SHARED src/data_processor.cpp)

set_target_properties(data_processor PROPERTIES OUTPUT_NAME "data_processor")

# Include directories
include_directories(src)

# Link libraries
find_package(Boost REQUIRED)
find_package(jsoncpp CONFIG REQUIRED)

# Link Boost and JsonCpp
target_link_libraries(data_processor Boost::boost JsonCpp::JsonCpp)
