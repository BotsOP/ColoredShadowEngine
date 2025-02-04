cmake_minimum_required(VERSION 3.20)
project(ColoredShadowEngine)

set(CMAKE_CXX_STANDARD 20)

find_package(glfw3 CONFIG REQUIRED)
find_package(glad CONFIG REQUIRED)

add_executable(ColoredShadowEngine main.cpp)
target_link_libraries(ColoredShadowEngine PRIVATE glfw glad::glad)
