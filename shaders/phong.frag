#version 330

out vec4 frag_color;

in vec3 frag_normal;
in vec3 frag_position;

uniform mat4 view;
uniform vec3 light;

void main (void) {
    frag_color = vec4(frag_normal, 1.0);
}
