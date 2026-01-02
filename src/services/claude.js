"use strict";
// CLAUDE SERVICE - the AI that decides what edits to use
// it reads the brain's catalog and outputs a manifest of what effects to apply
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIDEO_MODES = void 0;
exports.generateEditManifest = generateEditManifest;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const brain_1 = require("../core/brain");
// video modes with their vibes - tells claude how to edit
exports.VIDEO_MODES = {
    lemmino: {
        name: 'LEMMiNO Documentary',
        hitsPerMinute: 20,
        description: 'Smooth, minimal, professional documentary style. Focus on ken burns, subtle zooms, and elegant text reveals. Very clean and cinematic.',
        preferredCategories: ['motion', 'text', 'effect']
    },
    mrbeast: {
        name: 'MrBeast Style',
        hitsPerMinute: 40,
        description: 'High energy, lots of sound effects, zoom pulses, quick cuts, and flashy transitions. Keep the viewer engaged.',
        preferredCategories: ['motion', 'audio', 'transition', 'text']
    },
    tiktok: {
        name: 'TikTok/Brainrot',
        hitsPerMinute: 55,
        description: 'Rapid fire edits, constant zooms, meme sounds, shake effects, maximum engagement. Every second needs something.',
        preferredCategories: ['motion', 'audio', 'transition']
    },
    documentary: {
        name: 'Standard Documentary',
        hitsPerMinute: 15,
        description: 'Classic documentary feel with B-roll images, subtle color grading, minimal but impactful effects.',
        preferredCategories: ['overlay', 'effect', 'text']
    },
    tutorial: {
        name: 'Tutorial/How-To',
        hitsPerMinute: 12,
        description: 'Educational focus with clear text reveals, highlights, and step indicators. Keep it informative.',
        preferredCategories: ['text', 'overlay']
    },
    'beat-history': {
        name: 'Beat History',
        hitsPerMinute: 35,
        description: 'True crime and history style with dramatic reveals, sound effects, and visual emphasis on key moments.',
        preferredCategories: ['audio', 'motion', 'text', 'transition']
    },
    custom: {
        name: 'Custom',
        hitsPerMinute: 25,
        description: 'User-defined style. Balanced use of all available edits.',
        preferredCategories: ['motion', 'text', 'audio', 'effect', 'overlay', 'transition']
    }
};
// generate the edit manifest using claude
async function generateEditManifest(apiKey, transcript, mode, sourceVideo, assets) {
    const client = new sdk_1.default({ apiKey });
    // get mode config
    const modeConfig = exports.VIDEO_MODES[mode] || exports.VIDEO_MODES.custom;
    // get the edit catalog from brain - this is what tells claude what effects exist
    const editCatalog = brain_1.brain.generateEditCatalog();
    // get edits available for this mode
    const availableEdits = brain_1.brain.getForMode(mode);
    const editIds = availableEdits.map(e => e.meta.id);
    // format transcript for claude
    const formattedTranscript = transcript.segments.map(seg => `[${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s] ${seg.text}`).join('\n');
    // format available assets
    const assetsSection = `
## AVAILABLE ASSETS

### Audio SFX (for sound_hit and other audio edits):
${assets.audio.length > 0 ? assets.audio.map(f => `- ${f}`).join('\n') : '(none available - skip audio edits)'}

### Images (for image_drop, ken_burns overlays):
${assets.images.length > 0 ? assets.images.map(f => `- ${f}`).join('\n') : '(none available - use search keywords instead)'}
`;
    // build the prompt - this is crucial, tells claude exactly what to do
    const prompt = `You are an expert video editor creating an automated edit manifest for a ${modeConfig.name} style video.

## VIDEO MODE: ${modeConfig.name}
${modeConfig.description}

Target: ~${modeConfig.hitsPerMinute} hits per minute
Video duration: ${transcript.duration.toFixed(1)} seconds
Expected total hits: ~${Math.round((transcript.duration / 60) * modeConfig.hitsPerMinute)}

${editCatalog}

${assetsSection}

## TRANSCRIPT
${formattedTranscript}

## YOUR TASK
Generate an edit manifest JSON that creates a professionally edited video. For each moment:

1. Look at what's being said and pick appropriate edits
2. Match the ${mode} style - ${modeConfig.hitsPerMinute} hits/minute average
3. Use variety - don't spam the same edit over and over
4. Layer edits when it makes sense (zoom + text + sound together)
5. Time edits to words and phrases for maximum impact

## AVAILABLE EDIT IDs (only use these)
${editIds.join(', ')}

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanation) in this structure:
{
  "mode": "${mode}",
  "duration": ${transcript.duration},
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "sourceVideo": "${sourceVideo}",
  "scenes": [
    {
      "start": 0,
      "end": 10.5,
      "text": "transcript text for this section",
      "edits": [
        {
          "editId": "zoom_pulse",
          "at": 2.5,
          "duration": 0.8,
          "props": { "intensity": 1.2, "direction": "pulse" },
          "layer": 0
        },
        {
          "editId": "text_reveal",
          "at": 3.0,
          "duration": 2.0,
          "props": { "text": "KEYWORD", "style": "scale" },
          "layer": 1
        }
      ]
    }
  ]
}

IMPORTANT:
- Each scene should be 5-15 seconds of transcript
- "at" is absolute timestamp in seconds from video start
- "duration" is how long the edit effect lasts
- "layer" determines z-order (0 = bottom, higher = on top)
- For audio edits, use files from available assets
- Make it actually good - dont be lazy with the edits`;
    console.log('[claude] generating manifest for', transcript.duration.toFixed(1), 'seconds of content');
    console.log('[claude] mode:', mode, '- targeting', modeConfig.hitsPerMinute, 'hits/min');
    // call claude - using sonnet cause its fast and good
    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
    });
    // parse response
    const content = response.content[0];
    if (content.type !== 'text') {
        throw new Error('unexpected response type from claude');
    }
    // extract JSON (handle potential markdown wrapper cause claude sometimes does that)
    let jsonStr = content.text.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    const manifest = JSON.parse(jsonStr);
    // validate edits - make sure claude didnt hallucinate any
    let fixCount = 0;
    for (const scene of manifest.scenes) {
        for (const edit of scene.edits) {
            const validation = brain_1.brain.validateEditCall(edit.editId, edit.props);
            if (!validation.valid) {
                console.warn(`[claude] invalid edit ${edit.editId}:`, validation.errors);
                // try to fix with defaults
                edit.props = { ...brain_1.brain.getDefaultProps(edit.editId), ...edit.props };
                fixCount++;
            }
        }
    }
    if (fixCount > 0) {
        console.log(`[claude] fixed ${fixCount} invalid edit calls with defaults`);
    }
    const totalEdits = manifest.scenes.reduce((sum, s) => sum + s.edits.length, 0);
    console.log('[claude] generated manifest:', manifest.scenes.length, 'scenes,', totalEdits, 'edits');
    return manifest;
}
