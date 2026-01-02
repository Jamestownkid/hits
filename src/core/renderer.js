"use strict";
// EDIT RENDERER - this connects the brain to remotion
// brain tells us what edits to use, we load em and render em
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainVideo = exports.SceneRenderer = exports.EditRenderer = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
const brain_1 = require("./brain");
// component cache so we dont import the same component twice
const componentCache = new Map();
function getComponent(edit) {
    if (!componentCache.has(edit.meta.id)) {
        // dynamically import the component - this is the magic
        const loader = () => Promise.resolve(`${edit.componentPath}`).then(s => __importStar(require(s)));
        componentCache.set(edit.meta.id, (0, react_1.lazy)(loader));
    }
    return componentCache.get(edit.meta.id);
}
const EditRenderer = ({ instance, fps }) => {
    const edit = brain_1.brain.get(instance.editId);
    if (!edit) {
        console.warn(`[renderer] unknown edit: ${instance.editId} - check your /edits folder`);
        return null;
    }
    // merge default props with the ones from manifest
    const mergedProps = {
        ...brain_1.brain.getDefaultProps(instance.editId),
        ...instance.props,
        // always inject timing info so components can animate properly
        durationInFrames: Math.round(instance.duration * fps),
    };
    const Component = getComponent(edit);
    return fallback = { null:  } >
        { ...mergedProps } /  >
        /Suspense>;
};
exports.EditRenderer = EditRenderer;
const SceneRenderer = ({ scene, fps, sceneStartFrame }) => {
    // group edits by layer for proper z-ordering
    const layers = (0, react_1.useMemo)(() => {
        const grouped = {};
        for (const edit of scene.edits) {
            const layer = edit.layer ?? 0;
            if (!grouped[layer])
                grouped[layer] = [];
            grouped[layer].push(edit);
        }
        // sort by layer number so lower layers render first
        return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b));
    }, [scene.edits]);
    return ({ layers, : .map(([layerNum, edits]) => key = { layerNum }, style = {}, { zIndex: Number(layerNum) }) } >
        { edits, : .map((edit, i) => {
                const editStartFrame = Math.round(edit.at * fps) - sceneStartFrame;
                const editDurationFrames = Math.round(edit.duration * fps);
                return key = {} `${edit.editId}-${i}`;
            }, from = { editStartFrame }, durationInFrames = { editDurationFrames }
                >
                    instance, { edit }, fps = { fps } /  >
                /Sequence>)
        });
};
exports.SceneRenderer = SceneRenderer;
/AbsoluteFill>;
/>;
const MainVideo = ({ manifest }) => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    return style = {};
    {
        backgroundColor: '#000';
    }
};
exports.MainVideo = MainVideo;
 >
    { /* source video as the base layer */};
{
    manifest.sourceVideo && src;
    {
        manifest.sourceVideo;
    }
    style = {};
    {
        width: '100%', height;
        '100%', objectFit;
        'cover';
    }
}
/>
    < /AbsoluteFill>;
{ /* render each scene with its edits on top */ }
{
    manifest.scenes.map((scene, i) => {
        const sceneStartFrame = Math.round(scene.start * fps);
        const sceneDurationFrames = Math.round((scene.end - scene.start) * fps);
        return key = { i };
        from = { sceneStartFrame };
        durationInFrames = { sceneDurationFrames }
            >
                scene;
        {
            scene;
        }
        fps = { fps };
        sceneStartFrame = { sceneStartFrame }
            /  >
            /Sequence>;
    });
}
/AbsoluteFill>;
