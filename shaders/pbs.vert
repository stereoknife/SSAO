#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat3 normal_matrix;

out vec3 frag_normal;
out vec3 frag_position;
out vec2 texCoords;

void main(void)  {
    frag_normal = normalize(normal_matrix * normal);
    frag_normal = normal;
    frag_position = vec3(model * vec4(vert, 1.0));
    gl_Position = projection * view * model * vec4(vert, 1.0);
    texCoords = texCoord;
}
