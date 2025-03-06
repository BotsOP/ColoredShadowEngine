#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} fs_in;

uniform sampler2D shadowIDMap;
uniform sampler2D shadowMap;
uniform sampler2D diffuseTexture;
uniform sampler2D shadowCasterMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;


vec2 calculateScreenSpaceUV() {
    // Transform fragment position to clip space
    vec4 clipPos = projection * view * vec4(fs_in.FragPos, 1.0);

    // Convert to NDC (Normalized Device Coordinates)
    vec3 ndcPos = clipPos.xyz / clipPos.w;

    // Map from NDC [-1,1] to UV [0,1] range
    // Note: We flip Y because texture coordinates have origin at bottom-left
    vec2 screenSpaceUV = vec2(ndcPos.x * 0.5 + 0.5, ndcPos.y * 0.5 + 0.5);

    return screenSpaceUV;
}

float ShadowCalculation(vec4 fragPosLightSpace, sampler2D toSample)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(toSample, projCoords.xy).r;
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // calculate bias (based on depth map resolution and slope)
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    // check whether current frag pos is in shadow
    // float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;
    // PCF
    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(toSample, 0);
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture(toSample, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth  ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;

    // keep the shadow at 0.0 when outside the far_plane region of the light's frustum.
    if(projCoords.z > 1.0)
    shadow = 0.0;

    return shadow;
}

float random(float seed)
{
    return fract(sin(seed) * 43758.5453123);
}


void main()
{
    vec3 color = texture(diffuseTexture, fs_in.TexCoords).rgb;
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightColor = vec3(0.3);
    // ambient
    vec3 ambient = 0.1 * lightColor;
    // diffuse
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // specular
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
    // calculate shadow
    float shadow = ShadowCalculation(fs_in.FragPosLightSpace, shadowMap);

    vec3 projCoords = fs_in.FragPosLightSpace.xyz / fs_in.FragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowIDMap, projCoords.xy).r;
//    float closestDepth = 0;
//    for (int i = -1; i < 2; i++) {
//        for (int j = -1; j < 2; j++) {
//            float offsetIncrement = 0.001;
//            vec2 offset = vec2(i * offsetIncrement, j * offsetIncrement);
//            closestDepth += texture(shadowIDMap, projCoords.xy + offset).r;
////            closestDepth = min(closestDepth, texture(shadowIDMap, projCoords.xy + offset).r);
//        }
//    }
//    closestDepth /= 9;


    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;

    vec2 screenUV = calculateScreenSpaceUV();
    float shadowCasterMask = texture(shadowCasterMap, screenUV).r;

    float test = abs(closestDepth - shadowCasterMask);
//    FragColor = vec4(test, test, test, 1.0);
//    return;

    if(closestDepth > 0 && !(abs(closestDepth - shadowCasterMask) < 0.1))
    {
        FragColor = vec4(random(closestDepth), random(closestDepth + 1), random(closestDepth + 2), 1.0);
    }
    else
    {
        FragColor = vec4(lighting, 1.0);
    }
}

