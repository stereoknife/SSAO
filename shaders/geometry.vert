#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 normal_matrix;

out vec3 frag_normal;
out vec3 frag_position;
out vec3 camera_position;

void main(void)  {
    frag_normal = normalize(vec4(normal_matrix * vec4(normal, 1.0)).xyz);
    gl_Position = projection * view * model * vec4(vert, 1.0);
    frag_position = gl_Position.xyz;
}
