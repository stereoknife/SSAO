#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;

out vec2 tex_coords;

void main(void)  {
    tex_coords = (vert.xy * 0.5) + 0.5;
    gl_Position = vec4(vert.xy, 0.0, 1.0);
}
