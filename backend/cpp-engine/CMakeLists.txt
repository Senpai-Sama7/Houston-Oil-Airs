cmake_minimum_required(VERSION 3.10)
project(CppEngine)

set(CMAKE_CXX_STANDARD 17)

add_executable(CppEngine src/data_processor.cpp)

# Include directories
include_directories(src)

# Link libraries
find_package(Boost REQUIRED)
find_package(JsonCpp REQUIRED)

# Link Boost and JsonCpp
target_link_libraries(CppEngine Boost::boost JsonCpp::jsoncpp)
