# HITS - Plugin-Based Video Editor

A plugin-based automated video editor that uses AI to transform your videos into professionally edited content.

## Features

- **Brain/Tentacles Architecture**: Drop in edit plugins and the brain auto-discovers them
- **25+ Built-in Edit Effects**: Motion, text, audio, transitions, effects, and overlays
- **AI-Powered Editing**: Claude analyzes your transcript and picks the right edits
- **Multiple Video Modes**: LEMMiNO, MrBeast, TikTok, Documentary, Tutorial, Beat History
- **GPU Rendering**: Fast Remotion rendering with angle-egl support

## Quick Start

```bash
# run the appimage directly
./release/Hits-1.0.0.AppImage

# or for development
npm install
npm run dev
```

## How It Works

1. **Drop a video** - Select your source video or audio file
2. **Pick a mode** - Choose editing style (mrbeast, tiktok, lemmino, etc.)
3. **Wait for magic** - Whisper transcribes, Claude generates edits, Remotion renders
4. **Get your video** - Professionally edited video ready to go

## Adding New Edits

1. Find cool effects on [React Video Editor](https://reactvideoeditor.com/remotion-templates) or [Remotion Resources](https://remotion.dev/docs/resources)
2. Create two files in `/edits/[category]/`:
   - `my_effect.tsx` - The Remotion component
   - `my_effect.meta.json` - Metadata telling the brain how to use it
3. Run `npm run edits:scan` to verify it loads
4. The brain auto-discovers it and Claude knows how to use it

## Edit Categories

| Category | Description | Examples |
|----------|-------------|----------|
| motion | Movement effects | zoom_pulse, ken_burns, shake, glitch, spin, bounce |
| text | Text overlays | text_reveal, subtitle, counter, highlight, typewriter |
| audio | Sound effects | sound_hit, bass_drop |
| transition | Scene transitions | flash_transition, wipe, zoom_transition |
| effect | Visual filters | color_grade, vignette, blur, letterbox, chromatic_aberration |
| overlay | Image/info overlays | image_drop, lower_third, progress_bar, map_marker |

## Video Modes

| Mode | Hits/Min | Style |
|------|----------|-------|
| lemmino | 20 | Clean, cinematic documentary |
| mrbeast | 40 | High energy, flashy |
| tiktok | 55 | Rapid fire, brainrot |
| documentary | 15 | Classic, subtle |
| tutorial | 12 | Educational, clear |
| beat-history | 35 | Dramatic, true crime |

## Requirements

- **Claude API Key**: Get from [Anthropic](https://console.anthropic.com)
- **Whisper**: Uses nodejs-whisper with CUDA support
- **FUSE**: For AppImage (most Linux distros have it)

## Assets

The app works best with audio SFX and B-roll:
- Copy SFX files to your assets folder (settings → set assets directory)
- The naming convention from `AUDIO/` folder is preserved
- B-roll images can be used with image_drop and ken_burns effects

## Development

```bash
npm run dev              # run electron + vite
npm run remotion:preview # preview remotion compositions
npm run edits:scan       # scan for edit plugins
npm run edits:validate   # validate all edit plugins
npm run build            # build for production
npm run package:linux    # create AppImage
```

## Pro Tips

- Start with `documentary` mode if new to video editing
- `mrbeast` mode adds lots of hits - great for engagement
- Use high quality audio SFX for professional results
- The brain weights certain edits higher for specific modes
