export const TerrainFragmentShader = `
  uniform vec2 tileSize;
  uniform vec2 tileSpacing;
  uniform vec2 tileSetSize;
  uniform vec2 mapRepeat;
  uniform vec2 ${MapTileCoords.join(", ")};
  uniform vec2 ${MapRepeats.join(", ")};

  uniform sampler2D ${MaskNames.join(", ")};
  uniform sampler2D ${MapTextureName};

  varying float vDistanceToCamera;

  vec2 vec2LineFunc (vec2 min, vec2 max, vec2 v, vec2 vMin, vec2 vMax) {
    return (((v - vMin) / (vMax - vMin)) * (max - min)) + min;
  }

  vec4 getTileTexture(sampler2D textureData, vec2 tileCoords, vec2 uv) {
    vec2 uvMin = vec2(0., 0.);
    vec2 uvMax = vec2(1., 1.);
    vec2 halfVec2 = vec2(.5, .5);
    vec2 doubleVec2 = vec2(2., 2.);
    vec2 tileMaxSize = tileSize - (tileSpacing * doubleVec2) - uvMax;
    vec2 allTiles = floor((tileSetSize / tileSize) + halfVec2) - uvMax;
    vec2 coords = vec2(tileCoords.x, allTiles.y - tileCoords.y);
    vec2 tilingUV = fract(uv * mapRepeat);
    vec2 offset = ((tileSize * coords) + tileSpacing) + (tileMaxSize * tilingUV);
    vec2 textureUV = fract(vec2LineFunc(uvMin, uvMax, offset, uvMin, tileSetSize));

    return texture2D(textureData, textureUV);
  }

  vec4 lightMapTexelToLinear(vec4 texel) {
    return vec4(pow(texel.rgb, vec3(2.2)), texel.a);
  }

  vec4 invertColor(vec4 texel) {
    return vec4(1.0 - texel.r, 1.0 - texel.g, 1.0 - texel.b, texel.a);
  }

  #ifdef USE_AOMAP
    uniform sampler2D ${AoMapTextureName};
  #endif

  #ifdef USE_ROUGHNESSMAP
    uniform sampler2D ${RoughnessMapTextureName};
  #endif

  #ifdef USE_METALNESSMAP
    uniform sampler2D ${MetalnessMapTextureName};
  #endif

  ${BaseShader.fragmentShader
    // Координаты
    .replace("#include <uv_pars_fragment>", `
      #if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
        varying vec2 vUv;
        vec2 finalUv;
      #endif
    `)
    // Туман
    .replace("#include <fog_fragment>", `
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
        #else
          float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        #endif

        gl_FragColor.a = saturate(gl_FragColor.a - fogFactor);
      #endif
    `)
    // ! Карта параллакса
    .replace("void main() {", `
      #if defined( USE_PARALLAXMAP )
        uniform sampler2D ${ParallaxMapTextureName};
        uniform float parallaxScale;
        uniform float parallaxSteps;
        uniform float parallaxDistance;

        vec2 parallaxMap(vec3 V) {
          float layerHeight = 1.0 / parallaxSteps;
          float currentLayerHeight = 0.0;
          vec2 dtex = parallaxScale * V.xy / V.z / parallaxSteps;
          vec2 currentTextureCoords = vUv;
          float heightFromTexture = ${getTextureTexel(ParallaxMapTextureName, "r", "currentTextureCoords")};

          for ( int i = 0; i == 0; i += 0 ) {
            if ( heightFromTexture <= currentLayerHeight ) {
              break;
            }

            currentLayerHeight += layerHeight;
            currentTextureCoords -= dtex;
            heightFromTexture = ${getTextureTexel(ParallaxMapTextureName, "r", "currentTextureCoords")};
          }

          vec2 prevTCoords = currentTextureCoords + dtex;
          float nextH = heightFromTexture - currentLayerHeight;
          float prevH = ${getTextureTexel(ParallaxMapTextureName, "r", "prevTCoords")} - currentLayerHeight + layerHeight;
          float weight = nextH / ( nextH - prevH );

          return prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );
        }

				vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {
					vec2 texDx = dFdx( vUv );
					vec2 texDy = dFdy( vUv );

					vec3 vSigmaX = dFdx( surfPosition );
					vec3 vSigmaY = dFdy( surfPosition );
					vec3 vR1 = cross( vSigmaY, surfNormal );
					vec3 vR2 = cross( surfNormal, vSigmaX );
					float fDet = dot( vSigmaX, vR1 );

					vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );
					vec3 vProjVtex;
					vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;
					vProjVtex.z = dot( surfNormal, viewPosition );

					return parallaxMap( vProjVtex );
				}
      #endif

      void main() {
        finalUv = vUv;

        #ifdef USE_PARALLAXMAP
          if (vDistanceToCamera < parallaxDistance) {
            finalUv = perturbUv(-vViewPosition, normalize(vNormal), normalize(vViewPosition));
          }
        #endif
    `)
    // ! Текстурная карта
    .replace("#include <map_fragment>", `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = ${getTextureTexel(MapTextureName)};
        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
        #endif
        diffuseColor *= sampledDiffuseColor;
      #endif
    `)
    // ! Карта металичности
    .replace("#include <metalnessmap_fragment>", `
      float metalnessFactor = metalness;
      #ifdef USE_METALNESSMAP
        metalnessFactor *= ${getTextureTexel(MetalnessMapTextureName, "b")};
      #endif
    `)
    // ! Карта шероховатости
    .replace("#include <roughnessmap_fragment>", `
      float roughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        roughnessFactor *= ${getTextureTexel(RoughnessMapTextureName, "g")};
      #endif
    `)
    // ! Карта атмосферного свечения
    .replace("#include <aomap_fragment>", `
      #ifdef USE_AOMAP
        float ambientOcclusion = (${getTextureTexel(AoMapTextureName, "r")} - 1.) * aoMapIntensity + 1.;
        reflectedLight.indirectDiffuse *= ambientOcclusion;

        #if defined( USE_ENVMAP ) && defined( STANDARD )
          float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
          reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
        #endif
      #endif
    `)
    // ! Карта нормалей
    // Фрагмент 1
    .replace("#include <normalmap_pars_fragment>", `
      #ifdef USE_NORMALMAP
        uniform vec2 normalScale;
        uniform sampler2D ${NormalMapTextureName};

        vec3 perturbNormal2Arb (vec3 eye_pos, vec3 surf_norm) {
          vec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));
          vec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));
          vec2 st0 = dFdx(finalUv.st);
          vec2 st1 = dFdy(finalUv.st);
          vec3 S = normalize(q0 * st1.t - q1 * st0.t);
          vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
          vec3 N = normalize(surf_norm);
          vec4 full_normal = ${getTextureTexel(NormalMapTextureName)};
          vec3 mapN = full_normal.xyz * 2.0 - 1.0;
          mat3 tsn = mat3(S, T, N);

          mapN.xy = normalScale * mapN.xy;

          return normalize(tsn * mapN);
        }
      #endif
    `)
    // Фрагмент 2
    .replace("#include <normal_fragment_maps>", `
      #ifdef USE_CLEARCOAT
        vec3 clearcoatNormal = geometryNormal;
      #endif

      #ifdef USE_NORMALMAP
        normal = perturbNormal2Arb(-vViewPosition, normal);
      #endif
    `)
  }
`;