cmake_minimum_required(VERSION 3.30)
project(ColoredShadowEngine)

set(CMAKE_CXX_STANDARD 20)

file(COPY ${CMAKE_SOURCE_DIR}/shaders DESTINATION ${CMAKE_BINARY_DIR})
file(COPY ${CMAKE_SOURCE_DIR}/textures DESTINATION ${CMAKE_BINARY_DIR})

add_executable(ColoredShadowEngine main.cpp)

include_directories(${CMAKE_SOURCE_DIR}/libs)

find_package(assimp CONFIG REQUIRED)
target_link_libraries(ColoredShadowEngine PRIVATE assimp::assimp)
find_package(glad CONFIG REQUIRED)
target_link_libraries(ColoredShadowEngine PRIVATE glad::glad)
find_package(glfw3 CONFIG REQUIRED)
target_link_libraries(ColoredShadowEngine PRIVATE glfw)
