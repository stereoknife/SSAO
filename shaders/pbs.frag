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

// Fresnel Reflectance Function
vec3 schlick(vec3 f, float dlh) {
    return f + (1 - f) * pow(1 - dlh, 5);
}

// NDF Functions
float blinn_phong_ndf(float roughness, float dhn) {
    float power = 1 - roughness;
    float gloss = max(1, power * 50);
    float result = pow(dhn, gloss) * power;
    result *= (2 + power) / (2 * 3.1415926535);
    return result;
}

float beckmann_ndf(float roughness, float dhn) {
    float alpha = roughness * roughness;
    float dhnsq = dhn * dhn;
    float result = (1.0 / (3.1415926535 * alpha * dhnsq * dhnsq)) * exp((dhnsq - 1) / (alpha * dhnsq));
    return max(0.00001, result);
}

float ggx_ndf(float roughness, float dhn)
{
    float alpha = roughness*roughness;
    float dhnsq = dhn * dhn;
    float tandhnsq = (1-dhnsq)/dhnsq;
    return (1.0/3.1415926535) * pow(roughness/(dhnsq * (alpha + tandhnsq)), 2);
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
#ifdef PBR_MAPS
    float metalness = texture(metalness_map, texCoords).x;
    float roughness = texture(roughness_map, texCoords).x;
    vec3 albedo = texture(color_map, texCoords).rgb;
#else
    vec3 albedo = vec3(0.5,0.8,0.2);
#endif
    vec3 fresnel_color = mix(fresnel, albedo, metalness);
    vec3 light_color = vec3(1, 1, 1);

    vec3 light_dir = normalize(light - frag_position);
    vec3 view_position = inverse(view)[3].xyz;
    vec3 view_dir = normalize(view_position - frag_position);
    vec3 half_dir = normalize(light_dir + view_dir);

    float dln = max(dot(light_dir, frag_normal), 0);
    float dvn = max(dot(view_dir, frag_normal), 0);
    float dhn = max(dot(half_dir, frag_normal), 0);
    float dlh = max(dot(light_dir, half_dir), 0);
    float dvh = max(dot(view_dir, half_dir), 0);

    // --------
    // Diffuse
    // --------
    vec3 diffuse = albedo / 3.1416;

    // --------
    // Specular
    // --------
    // Fresnel
    vec3 f0 = schlick(fresnel, dlh);

    // Normal distribution
    float ndf = beckmann_ndf(roughness, dhn);

    // Geometry shadowing
    float geom = ap_geom(dln, dvn);

    vec3 specular = vec3(f0 * ndf * geom) / (4 * dln * dvn);

    // ------
    // Result
    // ------
    vec3 ks = f0;

    vec3 kd = vec3(1) - ks;
    kd *= 1 - metalness;

    vec3 result = vec3(diffuse * kd + specular * ks);
    result *= dln;

    float gamma = 2.2;
    result = pow(result, vec3(1.0/gamma));

    frag_color = vec4(result * light_color, 1);
}
