"use strict";
// THE BRAIN - this is where the magic happens fr fr
// scans the edits folder and builds a catalog of what we can do
// claude reads this catalog and decides what effects to slap on your video
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
exports.brain = void 0;
exports.defineEdit = defineEdit;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
// THE BRAIN CLASS - singleton that manages all the edit plugins
class EditBrain {
    edits = new Map();
    editsDir;
    loaded = false;
    constructor() {
        // edits live in /edits folder at project root
        this.editsDir = path.join(process.cwd(), 'edits');
    }
    // scan the edits folder and register everything we find
    // this runs on app start and whenever user drops new edits
    async scan() {
        console.log('[brain] scanning for edits in:', this.editsDir);
        // make the folder if it dont exist
        if (!fs.existsSync(this.editsDir)) {
            fs.mkdirSync(this.editsDir, { recursive: true });
            console.log('[brain] created edits folder - its empty rn but drop some plugins in there');
            return;
        }
        // clear old registrations
        this.edits.clear();
        // find all .meta.json files - thats how we know whats an edit
        const metaFiles = await (0, glob_1.glob)('**/*.meta.json', { cwd: this.editsDir });
        for (const metaFile of metaFiles) {
            try {
                const fullPath = path.join(this.editsDir, metaFile);
                const meta = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                // component file should be same name but .tsx instead of .meta.json
                const componentPath = fullPath.replace('.meta.json', '.tsx');
                if (!fs.existsSync(componentPath)) {
                    console.warn(`[brain] no component found for ${meta.id} - need ${componentPath}`);
                    continue;
                }
                this.edits.set(meta.id, {
                    meta,
                    componentPath
                });
                console.log(`[brain] registered: ${meta.id} (${meta.category})`);
            }
            catch (err) {
                console.error(`[brain] failed to load ${metaFile}:`, err);
            }
        }
        this.loaded = true;
        console.log(`[brain] loaded ${this.edits.size} edits total - we cookin now`);
    }
    // get all registered edits
    getAll() {
        return Array.from(this.edits.values());
    }
    // get edit by id
    get(id) {
        return this.edits.get(id);
    }
    // get edits by category
    getByCategory(category) {
        return this.getAll().filter(e => e.meta.category === category);
    }
    // get edits that work for a specific mode (lemmino, mrbeast, etc)
    getForMode(mode) {
        return this.getAll().filter(e => {
            if (!e.meta.modes)
                return true; // available in all modes if not specified
            return e.meta.modes.includes(mode);
        });
    }
    // get edits matching trigger keywords in text
    getByTriggers(text) {
        const words = text.toLowerCase().split(/\s+/);
        return this.getAll().filter(e => {
            if (!e.meta.triggers)
                return false;
            return e.meta.triggers.some(t => words.includes(t.toLowerCase()));
        });
    }
    // generate the catalog for claude - tells it what edits exist and how to use them
    // this is the key thing - claude reads this and knows how to edit your video
    generateEditCatalog() {
        const categories = {};
        for (const edit of this.getAll()) {
            const cat = edit.meta.category;
            if (!categories[cat])
                categories[cat] = [];
            categories[cat].push(edit);
        }
        let catalog = '## AVAILABLE EDITS\n\n';
        catalog += 'These are all the edit effects you can use. Pick the right ones based on the content.\n\n';
        for (const [category, edits] of Object.entries(categories)) {
            catalog += `### ${category.toUpperCase()}\n`;
            for (const edit of edits) {
                catalog += `\n**${edit.meta.id}** - ${edit.meta.name}\n`;
                catalog += `${edit.meta.description}\n`;
                catalog += `Props:\n`;
                for (const prop of edit.meta.props) {
                    catalog += `  - ${prop.name} (${prop.type}): ${prop.description || 'no description'}`;
                    if (prop.default !== undefined)
                        catalog += ` [default: ${prop.default}]`;
                    catalog += '\n';
                }
                if (edit.meta.triggers?.length) {
                    catalog += `Triggers: ${edit.meta.triggers.join(', ')}\n`;
                }
            }
            catalog += '\n';
        }
        return catalog;
    }
    // validate an edit call from claude - make sure it makes sense
    validateEditCall(editId, props) {
        const edit = this.get(editId);
        if (!edit)
            return { valid: false, errors: [`unknown edit: ${editId} - did you add it to /edits?`] };
        const errors = [];
        for (const propDef of edit.meta.props) {
            const value = props[propDef.name];
            // check required props have values
            if (value === undefined && propDef.default === undefined) {
                errors.push(`missing required prop: ${propDef.name}`);
                continue;
            }
            // type checking - make sure values are right type
            if (value !== undefined) {
                if (propDef.type === 'number' && typeof value !== 'number') {
                    errors.push(`${propDef.name} should be number, got ${typeof value}`);
                }
                if (propDef.type === 'string' && typeof value !== 'string') {
                    errors.push(`${propDef.name} should be string, got ${typeof value}`);
                }
                if (propDef.type === 'boolean' && typeof value !== 'boolean') {
                    errors.push(`${propDef.name} should be boolean, got ${typeof value}`);
                }
                if (propDef.type === 'select' && propDef.options && !propDef.options.includes(value)) {
                    errors.push(`${propDef.name} must be one of: ${propDef.options.join(', ')}`);
                }
                if (propDef.type === 'number' && propDef.min !== undefined && value < propDef.min) {
                    errors.push(`${propDef.name} must be >= ${propDef.min}`);
                }
                if (propDef.type === 'number' && propDef.max !== undefined && value > propDef.max) {
                    errors.push(`${propDef.name} must be <= ${propDef.max}`);
                }
            }
        }
        return { valid: errors.length === 0, errors };
    }
    // get default props for an edit
    getDefaultProps(editId) {
        const edit = this.get(editId);
        if (!edit)
            return {};
        const defaults = {};
        for (const prop of edit.meta.props) {
            if (prop.default !== undefined) {
                defaults[prop.name] = prop.default;
            }
        }
        return defaults;
    }
    // check if brain is ready
    isLoaded() {
        return this.loaded;
    }
    // get count of registered edits
    getCount() {
        return this.edits.size;
    }
}
// singleton instance - the one brain to rule them all
exports.brain = new EditBrain();
// helper to create edit metadata (for component authors)
function defineEdit(meta) {
    return meta;
}
