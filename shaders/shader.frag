#version 330 core
out vec4 FragColor;

in vec3 normal;

uniform float shadowID;

void main()
{
//    FragColor = vec4(vec3(1), 1.0);
    FragColor = vec4(vec3(shadowID), 1.0);
}