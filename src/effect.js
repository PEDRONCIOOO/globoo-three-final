import { EffectPass, BloomEffect, DepthOfFieldEffect, HueSaturationEffect, VignetteEffect, SMAAEffect } from 'postprocessing';

function initEffect(composer, camera) {
    // smaa
    const smaaEffect = new SMAAEffect();
    const smaaPass = new EffectPass(camera, smaaEffect);
    composer.addPass(smaaPass);
    // bloom
    const bloomEffect = new BloomEffect({
        mipmapBlur: true,
        intensity: 0.9,
        levels: 9,
        luminanceSmoothing: 0.1,
        luminanceThreshold: 0.7
    })
    const bloomPass = new EffectPass(camera, bloomEffect);
    composer.addPass(bloomPass);
    // depth of field
    const depthOfFieldEffect = new DepthOfFieldEffect(camera, {
        focusDistance: 0.0005,
        focalLength: 0.15,
        bokehScale: 16,
    })
    const depthOfFieldPass = new EffectPass(camera, depthOfFieldEffect);
    composer.addPass(depthOfFieldPass);
    // hue saturation
    const hueSaturationEffect = new HueSaturationEffect({
        saturation: 0.5,
        hue: 0.15
    })
    const hueSaturationPass = new EffectPass(camera, hueSaturationEffect);
    composer.addPass(hueSaturationPass);
    // vignette
    const vignetteEffect = new VignetteEffect({
        offset: 0.45,
        darkness: 0.45
    })
    const vignettePass = new EffectPass(camera, vignetteEffect);
    composer.addPass(vignettePass);
}

export { initEffect }