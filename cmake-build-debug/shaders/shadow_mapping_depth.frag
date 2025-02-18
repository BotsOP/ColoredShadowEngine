#version 330 core
out vec4 FragColor;

uniform float shadowID;

void main()
{
    FragColor = vec4(shadowID, shadowID, shadowID, 1.0);
}