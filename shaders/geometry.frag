#version 330

layout (location = 0) out vec3 albedo;
layout (location = 1) out vec3 normal;
layout (location = 2) out vec3 depth;

in vec3 frag_normal;
in vec3 frag_position;

void main (void) {
    albedo = vec3(1.0, 1.0, 0.0);
    normal = frag_normal;
    depth = frag_position;
    //frag_color = vec4(frag_normal, 1.0);
}
