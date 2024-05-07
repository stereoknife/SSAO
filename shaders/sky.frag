#version 330

out vec4 frag_color;

uniform sampler2D screen_tex;

in vec2 tex_coords;

void main (void) {
    //frag_color = texture(screen_tex, tex_coords);
    frag_color=vec4(tex_coords.x, tex_coords.y, 0.0, 1.0);
}
