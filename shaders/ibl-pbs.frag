#version 330

// #define PBR_MAPS

out vec4 frag_color;

in vec3 frag_normal;
in vec3 frag_position;
in vec2 texCoords;

uniform vec3 light;
uniform vec3 fresnel;

#ifdef PBR_MAPS
uniform sampler2D roughness_map;
uniform sampler2D metalness_map;
uniform sampler2D color_map;
#else
uniform float roughness;
uniform float metalness;
#endif

uniform mat4 view;
uniform mat4 model;
uniform samplerCube diffuse_map;
uniform samplerCube specular_map;

// Fresnel Reflectance Function
vec3 schlick(vec3 f, float dlh) {
    return f + (1 - f) * pow(1 - dlh, 5);
}

// Geometry Functions
float implicit_geom (float dln, float dvn) {
    return dln * dvn;
}

// Cook-Torrance
float ct_geom (float dln, float dvn, float dvh, float dhn) {
    return min(1.0, min (2 * dhn * dvn / dvh , 2 * dhn * dln / dvh));
}

// Ashikhmin-Premoze
float ap_geom (float dln, float dvn) {
    return dln * dvn / (dln + dvn - dln * dvn);
}

void main (void) {
    // Values
    float gamma = 2.2;
#ifdef PBR_MAPS
    float metalness = texture(metalness_map, texCoords).x;
    float roughness = texture(roughness_map, texCoords).x;
    vec3 albedo = texture(color_map, texCoords).rgb;
#else
    vec3 albedo = vec3(0.5,0.7,0.2);
#endif
    vec3 fresnel_color = mix(fresnel, albedo, metalness);
    vec3 light_color = vec3(1, 1, 1);

    vec3 view_position = inverse(view)[3].xyz;
    vec3 view_dir = normalize(view_position - frag_position);

    float dvn = max(dot(view_dir, frag_normal), 0);

    // --------
    // Diffuse
    // --------
    vec3 irradiance = texture(diffuse_map, frag_normal).rgb;
    irradiance = pow(irradiance, vec3(gamma)); // Undo gamma correction for texture
    vec3 diffuse = irradiance * albedo;

    // --------
    // Specular
    // --------
    // Fresnel
    vec3 f0 = schlick(fresnel_color, dvn);

    // Specular irradiance
    vec3 reflection = reflect(-view_dir, frag_normal);
    vec3 spec_irradiance = textureLod(specular_map, reflection, roughness * 6).rgb;
    spec_irradiance = pow(spec_irradiance, vec3(gamma)); // Undo gamma correction for texture

    // Geometry shadowing
    float geom = implicit_geom(dvn, dvn);
    vec3 specular = vec3(f0 * geom * spec_irradiance) / (4 * dvn * dvn);

    // ------
    // Result
    // ------
    vec3 ks = f0;

    vec3 kd = vec3(1) - ks;
    kd *= 1 - metalness;

    vec3 result = vec3(diffuse * kd + specular * ks);
    //result *= dln;
    result *= 2;

    result = pow(result, vec3(1.0/gamma));

    frag_color = vec4(result, 1);
}
