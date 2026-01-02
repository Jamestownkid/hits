"use strict";
// EFFECTS SCHEMA - Type-safe configuration for all 100 effects
// Based on professional Remotion patterns with Zod validation
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomEffectForKeyword = exports.getEffectsForMode = exports.MODE_CONFIGS = exports.modeConfigSchema = exports.effectSchema = exports.audioPropsSchema = exports.brollPropsSchema = exports.colorPropsSchema = exports.motionPropsSchema = exports.overlayPropsSchema = exports.transitionPropsSchema = exports.textPropsSchema = exports.zoomPropsSchema = exports.effectTimingSchema = exports.effectTriggerSchema = exports.LayerType = exports.layerTypes = exports.EasingFunction = exports.easingFunctions = exports.CornerPosition = exports.cornerPositions = exports.VideoMode = exports.videoModes = exports.EffectCategory = exports.effectCategories = void 0;
const zod_1 = require("zod");
// ==================== EFFECT CATEGORIES ====================
exports.effectCategories = ['zoom', 'text', 'transition', 'overlay', 'motion', 'color', 'broll', 'audio'];
exports.EffectCategory = zod_1.z.enum(exports.effectCategories);
// ==================== VIDEO MODES ====================
exports.videoModes = [
    'lemmino', 'mrbeast', 'tiktok', 'documentary', 'tutorial',
    'vox', 'truecrime', 'naturedoc', 'shorts', 'gaming',
    'course', 'cinematic', 'trailer', 'podcast', 'aesthetic', 'vlog'
];
exports.VideoMode = zod_1.z.enum(exports.videoModes);
// ==================== CORNER POSITIONS ====================
exports.cornerPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
exports.CornerPosition = zod_1.z.enum(exports.cornerPositions);
// ==================== EASING FUNCTIONS ====================
exports.easingFunctions = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring', 'bounce'];
exports.EasingFunction = zod_1.z.enum(exports.easingFunctions);
// ==================== LAYER PRIORITIES ====================
exports.layerTypes = ['background', 'video', 'overlay', 'text', 'foreground'];
exports.LayerType = zod_1.z.enum(exports.layerTypes);
// ==================== EFFECT TRIGGER CONFIG ====================
exports.effectTriggerSchema = zod_1.z.object({
    keywords: zod_1.z.array(zod_1.z.string()).default([]), // words that trigger this effect
    punctuation: zod_1.z.array(zod_1.z.string()).default([]), // punctuation that triggers (!, ?, ...)
    sentiment: zod_1.z.enum(['positive', 'negative', 'neutral', 'any']).default('any'),
    weight: zod_1.z.number().min(0).max(1).default(0.5), // how likely to be chosen
    maxPerMinute: zod_1.z.number().default(10), // rate limiting
    minGapFrames: zod_1.z.number().default(30), // minimum frames between uses
});
// ==================== EFFECT TIMING CONFIG ====================
exports.effectTimingSchema = zod_1.z.object({
    minDuration: zod_1.z.number().default(15), // minimum frames
    maxDuration: zod_1.z.number().default(90), // maximum frames
    defaultDuration: zod_1.z.number().default(30), // default if not specified
    cooldown: zod_1.z.number().default(60), // frames before can be used again
    attackFrames: zod_1.z.number().default(5), // fade in frames
    releaseFrames: zod_1.z.number().default(5), // fade out frames
});
// ==================== EFFECT PROP SCHEMAS ====================
// Zoom effects
exports.zoomPropsSchema = zod_1.z.object({
    intensity: zod_1.z.number().min(1).max(3).default(1.2),
    direction: zod_1.z.enum(['in', 'out']).default('in'),
    origin: zod_1.z.enum(['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).default('center'),
    easing: exports.EasingFunction.default('ease-out'),
});
// Text effects
exports.textPropsSchema = zod_1.z.object({
    text: zod_1.z.string().default(''),
    fontSize: zod_1.z.number().min(12).max(300).default(80),
    fontFamily: zod_1.z.string().default('Impact'),
    fontWeight: zod_1.z.number().min(100).max(900).default(700),
    color: zod_1.z.string().default('#ffffff'),
    strokeColor: zod_1.z.string().default('#000000'),
    strokeWidth: zod_1.z.number().default(2),
    shadowColor: zod_1.z.string().default('rgba(0,0,0,0.5)'),
    shadowBlur: zod_1.z.number().default(10),
    position: exports.CornerPosition.default('center'),
    animation: zod_1.z.enum(['pop', 'slide', 'fade', 'typewriter', 'bounce', 'glitch', 'wave']).default('pop'),
});
// Transition effects
exports.transitionPropsSchema = zod_1.z.object({
    color: zod_1.z.string().default('#000000'),
    direction: zod_1.z.enum(['left', 'right', 'up', 'down', 'radial']).default('left'),
    style: zod_1.z.enum(['wipe', 'fade', 'flash', 'pixel', 'glitch', 'zoom', 'spin']).default('wipe'),
});
// Overlay effects
exports.overlayPropsSchema = zod_1.z.object({
    opacity: zod_1.z.number().min(0).max(1).default(0.8),
    color: zod_1.z.string().default('#000000'),
    blendMode: zod_1.z.enum(['normal', 'multiply', 'screen', 'overlay', 'soft-light']).default('normal'),
    position: exports.CornerPosition.default('center'),
    size: zod_1.z.number().min(50).max(800).default(300),
});
// Motion effects
exports.motionPropsSchema = zod_1.z.object({
    intensity: zod_1.z.number().min(1).max(50).default(10),
    speed: zod_1.z.number().min(0.1).max(10).default(1),
    direction: zod_1.z.enum(['horizontal', 'vertical', 'both', 'circular']).default('both'),
    easing: exports.EasingFunction.default('ease-in-out'),
});
// Color effects
exports.colorPropsSchema = zod_1.z.object({
    intensity: zod_1.z.number().min(0).max(2).default(1),
    hueShift: zod_1.z.number().min(-180).max(180).default(0),
    saturation: zod_1.z.number().min(0).max(2).default(1),
    brightness: zod_1.z.number().min(0).max(2).default(1),
    contrast: zod_1.z.number().min(0).max(2).default(1),
    temperature: zod_1.z.enum(['warm', 'cool', 'neutral']).default('neutral'),
});
// B-roll effects
exports.brollPropsSchema = zod_1.z.object({
    src: zod_1.z.string().default(''),
    position: exports.CornerPosition.default('top-right'),
    size: zod_1.z.number().min(100).max(800).default(300),
    borderRadius: zod_1.z.number().default(12),
    borderColor: zod_1.z.string().default('#ffffff'),
    borderWidth: zod_1.z.number().default(3),
    shadow: zod_1.z.boolean().default(true),
    animation: zod_1.z.enum(['scale', 'slide', 'fade', 'bounce']).default('scale'),
});
// Audio visual effects
exports.audioPropsSchema = zod_1.z.object({
    color: zod_1.z.string().default('#00ffff'),
    bars: zod_1.z.number().min(5).max(100).default(20),
    sensitivity: zod_1.z.number().min(0.1).max(2).default(1),
    style: zod_1.z.enum(['bars', 'waveform', 'circle', 'spectrum']).default('bars'),
    position: zod_1.z.enum(['bottom', 'top', 'center', 'background']).default('bottom'),
});
// ==================== MAIN EFFECT SCHEMA ====================
exports.effectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: exports.EffectCategory,
    layer: exports.LayerType.default('overlay'),
    priority: zod_1.z.number().min(0).max(100).default(50),
    // Which video modes this effect works best with
    modes: zod_1.z.array(exports.VideoMode).default(['lemmino', 'documentary']),
    // Effects that can't be used together
    conflicts: zod_1.z.array(zod_1.z.string()).default([]),
    // Effects that work well together
    pairsWith: zod_1.z.array(zod_1.z.string()).default([]),
    // Trigger configuration
    triggers: exports.effectTriggerSchema,
    // Timing configuration
    timing: exports.effectTimingSchema,
    // Props schema (type-specific)
    props: zod_1.z.record(zod_1.z.any()).default({}),
    // Variants of this effect
    variants: zod_1.z.array(zod_1.z.string()).default([]),
    // Required assets
    assets: zod_1.z.object({
        required: zod_1.z.array(zod_1.z.string()).default([]),
        optional: zod_1.z.array(zod_1.z.string()).default([]),
    }).default({ required: [], optional: [] }),
});
// ==================== MODE CONFIGURATIONS ====================
exports.modeConfigSchema = zod_1.z.object({
    name: exports.VideoMode,
    displayName: zod_1.z.string(),
    emoji: zod_1.z.string(),
    description: zod_1.z.string(),
    editsPerMinute: zod_1.z.number().min(5).max(60).default(20),
    preferredEffects: zod_1.z.array(zod_1.z.string()).default([]),
    avoidEffects: zod_1.z.array(zod_1.z.string()).default([]),
    colorGrade: zod_1.z.string().default('cinematic'),
    pacing: zod_1.z.enum(['slow', 'medium', 'fast', 'chaotic']).default('medium'),
    brollFrequency: zod_1.z.number().min(0).max(1).default(0.3),
    textOverlayFrequency: zod_1.z.number().min(0).max(1).default(0.2),
});
// ==================== MODE PRESETS ====================
exports.MODE_CONFIGS = {
    lemmino: {
        name: 'lemmino',
        displayName: 'Lemmino',
        emoji: '🎬',
        description: 'Cinematic documentary style with slow zooms and letterbox',
        editsPerMinute: 8,
        preferredEffects: ['zoom_in_slow', 'letterbox', 'cinematic', 'vignette', 'ken_burns_broll'],
        avoidEffects: ['zoom_punch', 'shake_heavy', 'emoji_rain', 'confetti'],
        colorGrade: 'cinematic',
        pacing: 'slow',
        brollFrequency: 0.4,
        textOverlayFrequency: 0.1,
    },
    mrbeast: {
        name: 'mrbeast',
        displayName: 'MrBeast',
        emoji: '🔥',
        description: 'High energy with fast cuts, zooms, and text pops',
        editsPerMinute: 40,
        preferredEffects: ['zoom_punch', 'flash_white', 'text_pop', 'shake_heavy', 'subscribe_button', 'emoji_rain'],
        avoidEffects: ['zoom_in_slow', 'letterbox', 'noir'],
        colorGrade: 'saturate_boost',
        pacing: 'chaotic',
        brollFrequency: 0.5,
        textOverlayFrequency: 0.6,
    },
    tiktok: {
        name: 'tiktok',
        displayName: 'TikTok',
        emoji: '📱',
        description: 'Trendy effects with bouncy animations and emojis',
        editsPerMinute: 50,
        preferredEffects: ['zoom_bounce', 'text_bounce', 'emoji_rain', 'confetti', 'neon_glow', 'text_gradient'],
        avoidEffects: ['letterbox', 'noir', 'sepia'],
        colorGrade: 'saturate_boost',
        pacing: 'chaotic',
        brollFrequency: 0.3,
        textOverlayFrequency: 0.7,
    },
    documentary: {
        name: 'documentary',
        displayName: 'Documentary',
        emoji: '🎥',
        description: 'Professional documentary with subtle effects',
        editsPerMinute: 12,
        preferredEffects: ['zoom_in_slow', 'pan_left', 'pan_right', 'vignette', 'warm_grade', 'ken_burns_broll'],
        avoidEffects: ['glitch_transition', 'emoji_rain', 'neon_glow'],
        colorGrade: 'cinematic',
        pacing: 'slow',
        brollFrequency: 0.5,
        textOverlayFrequency: 0.15,
    },
    tutorial: {
        name: 'tutorial',
        displayName: 'Tutorial',
        emoji: '📚',
        description: 'Educational with clear text and highlights',
        editsPerMinute: 15,
        preferredEffects: ['zoom_focus', 'spotlight', 'arrow_pointer', 'text_typewriter', 'progress_bar'],
        avoidEffects: ['shake_heavy', 'glitch_transition', 'emoji_rain'],
        colorGrade: 'contrast_boost',
        pacing: 'medium',
        brollFrequency: 0.2,
        textOverlayFrequency: 0.4,
    },
    vox: {
        name: 'vox',
        displayName: 'Vox Explainer',
        emoji: '📊',
        description: 'Clean explainer style with data visualization',
        editsPerMinute: 18,
        preferredEffects: ['zoom_in_slow', 'text_slide_in', 'progress_bar', 'spotlight', 'cold_grade'],
        avoidEffects: ['emoji_rain', 'confetti', 'fire_overlay'],
        colorGrade: 'cold_grade',
        pacing: 'medium',
        brollFrequency: 0.4,
        textOverlayFrequency: 0.5,
    },
    truecrime: {
        name: 'truecrime',
        displayName: 'True Crime',
        emoji: '🔍',
        description: 'Dark and suspenseful with dramatic effects',
        editsPerMinute: 10,
        preferredEffects: ['zoom_in_slow', 'vignette', 'noir', 'dramatic', 'shake_light', 'spotlight'],
        avoidEffects: ['emoji_rain', 'confetti', 'saturate_boost', 'subscribe_button'],
        colorGrade: 'noir',
        pacing: 'slow',
        brollFrequency: 0.3,
        textOverlayFrequency: 0.2,
    },
    naturedoc: {
        name: 'naturedoc',
        displayName: 'Nature Doc',
        emoji: '🌿',
        description: 'Beautiful nature footage with Ken Burns',
        editsPerMinute: 6,
        preferredEffects: ['ken_burns_broll', 'zoom_in_slow', 'zoom_out_slow', 'warm_grade', 'vignette'],
        avoidEffects: ['glitch_transition', 'shake_heavy', 'emoji_rain', 'neon_glow'],
        colorGrade: 'warm_grade',
        pacing: 'slow',
        brollFrequency: 0.7,
        textOverlayFrequency: 0.05,
    },
    shorts: {
        name: 'shorts',
        displayName: 'YouTube Shorts',
        emoji: '⚡',
        description: 'Quick vertical content with fast effects',
        editsPerMinute: 45,
        preferredEffects: ['zoom_punch', 'text_pop', 'flash_white', 'subscribe_button', 'emoji_rain'],
        avoidEffects: ['letterbox', 'zoom_in_slow'],
        colorGrade: 'saturate_boost',
        pacing: 'chaotic',
        brollFrequency: 0.4,
        textOverlayFrequency: 0.6,
    },
    gaming: {
        name: 'gaming',
        displayName: 'Gaming',
        emoji: '🎮',
        description: 'Gaming content with energetic effects',
        editsPerMinute: 35,
        preferredEffects: ['zoom_punch', 'shake_heavy', 'neon_glow', 'glitch_transition', 'fire_overlay'],
        avoidEffects: ['letterbox', 'sepia', 'vintage'],
        colorGrade: 'neon_glow',
        pacing: 'fast',
        brollFrequency: 0.2,
        textOverlayFrequency: 0.4,
    },
    course: {
        name: 'course',
        displayName: 'Online Course',
        emoji: '🎓',
        description: 'Professional educational content',
        editsPerMinute: 10,
        preferredEffects: ['zoom_focus', 'spotlight', 'text_typewriter', 'progress_bar', 'arrow_pointer'],
        avoidEffects: ['shake_heavy', 'emoji_rain', 'glitch_transition'],
        colorGrade: 'contrast_boost',
        pacing: 'slow',
        brollFrequency: 0.15,
        textOverlayFrequency: 0.3,
    },
    cinematic: {
        name: 'cinematic',
        displayName: 'Cinematic',
        emoji: '🎞️',
        description: 'Film-like quality with letterbox and grades',
        editsPerMinute: 8,
        preferredEffects: ['letterbox', 'cinematic', 'vignette', 'zoom_in_slow', 'dolly_zoom'],
        avoidEffects: ['emoji_rain', 'subscribe_button', 'neon_glow'],
        colorGrade: 'cinematic',
        pacing: 'slow',
        brollFrequency: 0.4,
        textOverlayFrequency: 0.1,
    },
    trailer: {
        name: 'trailer',
        displayName: 'Movie Trailer',
        emoji: '🎬',
        description: 'Epic trailer style with dramatic effects',
        editsPerMinute: 25,
        preferredEffects: ['flash_black', 'zoom_punch', 'text_pop', 'dramatic', 'letterbox', 'bass_pulse'],
        avoidEffects: ['emoji_rain', 'subscribe_button'],
        colorGrade: 'dramatic',
        pacing: 'fast',
        brollFrequency: 0.3,
        textOverlayFrequency: 0.4,
    },
    podcast: {
        name: 'podcast',
        displayName: 'Podcast',
        emoji: '🎙️',
        description: 'Clean podcast style with minimal effects',
        editsPerMinute: 8,
        preferredEffects: ['zoom_in_slow', 'audio_bars', 'waveform', 'vignette'],
        avoidEffects: ['shake_heavy', 'emoji_rain', 'glitch_transition', 'confetti'],
        colorGrade: 'warm_grade',
        pacing: 'slow',
        brollFrequency: 0.1,
        textOverlayFrequency: 0.15,
    },
    aesthetic: {
        name: 'aesthetic',
        displayName: 'Aesthetic/ASMR',
        emoji: '✨',
        description: 'Soft aesthetic vibes with gentle effects',
        editsPerMinute: 5,
        preferredEffects: ['zoom_in_slow', 'particles', 'vintage', 'blur_focus', 'light_leak'],
        avoidEffects: ['shake_heavy', 'zoom_punch', 'glitch_transition', 'flash_white'],
        colorGrade: 'vintage',
        pacing: 'slow',
        brollFrequency: 0.3,
        textOverlayFrequency: 0.05,
    },
    vlog: {
        name: 'vlog',
        displayName: 'Vlog',
        emoji: '📹',
        description: 'Casual vlog style with fun effects',
        editsPerMinute: 20,
        preferredEffects: ['zoom_punch', 'text_pop', 'emoji_rain', 'warm_grade', 'pip_center'],
        avoidEffects: ['noir', 'letterbox'],
        colorGrade: 'warm_grade',
        pacing: 'medium',
        brollFrequency: 0.3,
        textOverlayFrequency: 0.3,
    },
};
// ==================== EFFECT REGISTRY HELPERS ====================
const getEffectsForMode = (mode, allEffects) => {
    const config = exports.MODE_CONFIGS[mode];
    return allEffects.filter(effect => effect.modes.includes(mode) &&
        !config.avoidEffects.includes(effect.id)).sort((a, b) => {
        const aPreferred = config.preferredEffects.includes(a.id) ? 1 : 0;
        const bPreferred = config.preferredEffects.includes(b.id) ? 1 : 0;
        return bPreferred - aPreferred;
    });
};
exports.getEffectsForMode = getEffectsForMode;
const getRandomEffectForKeyword = (keyword, mode, allEffects, usedRecently = []) => {
    const modeEffects = (0, exports.getEffectsForMode)(mode, allEffects);
    const keywordLower = keyword.toLowerCase();
    // Find effects triggered by this keyword
    const triggered = modeEffects.filter(e => e.triggers.keywords.some(k => keywordLower.includes(k.toLowerCase())) &&
        !usedRecently.includes(e.id));
    if (triggered.length > 0) {
        // Weight-based random selection
        const totalWeight = triggered.reduce((sum, e) => sum + e.triggers.weight, 0);
        let random = Math.random() * totalWeight;
        for (const effect of triggered) {
            random -= effect.triggers.weight;
            if (random <= 0)
                return effect;
        }
        return triggered[0];
    }
    // Fallback: random effect from mode
    const available = modeEffects.filter(e => !usedRecently.includes(e.id));
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
};
exports.getRandomEffectForKeyword = getRandomEffectForKeyword;
// Export everything for brain to use
exports.default = {
    effectCategories: exports.effectCategories,
    videoModes: exports.videoModes,
    cornerPositions: exports.cornerPositions,
    MODE_CONFIGS: exports.MODE_CONFIGS,
    getEffectsForMode: exports.getEffectsForMode,
    getRandomEffectForKeyword: exports.getRandomEffectForKeyword,
};
