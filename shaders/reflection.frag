#version 330

out vec4 frag_color;

in vec3 frag_normal;
in vec3 frag_position;

uniform mat4 view;
uniform samplerCube specular_map;

void main (void) {
    vec3 view_pos = inverse(view)[3].xyz;
    vec3 view_dir = normalize(frag_position - view_pos);

    vec3 reflection = reflect(view_dir, frag_normal);

    vec4 result = texture(specular_map, reflection);

    float gamma = 2.2;
    result.rgb = pow(result.rgb, vec3(1.0/gamma));

    frag_color = texture(specular_map, reflection);
}
