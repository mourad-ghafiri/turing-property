// ============================================================================
// FILE OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('fileSize', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'size' in file) {
        return (file as { size: number }).size;
    }
    return 0;
});

reg('fileName', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'name' in file) {
        return (file as { name: string }).name;
    }
    return '';
});

reg('fileExt', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    let name = '';
    if (typeof file === 'string') {
        name = file;
    } else if (file && typeof file === 'object' && 'name' in file) {
        name = (file as { name: string }).name;
    }
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() ?? '' : '';
});

reg('fileType', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        return (file as { type: string }).type;
    }
    return '';
});

reg('isImage', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        return (file as { type: string }).type.startsWith('image/');
    }
    return false;
});

reg('isPdf', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        return (file as { type: string }).type === 'application/pdf';
    }
    return false;
});

reg('isVideo', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        return (file as { type: string }).type.startsWith('video/');
    }
    return false;
});

reg('isAudio', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        return (file as { type: string }).type.startsWith('audio/');
    }
    return false;
});

reg('isDocument', async (args, ctx) => {
    const [file] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file) {
        const type = (file as { type: string }).type;
        return type === 'application/pdf' ||
               type.includes('word') ||
               type.includes('document') ||
               type.includes('spreadsheet') ||
               type.includes('excel');
    }
    return false;
});

reg('isFileType', async (args, ctx) => {
    const [file, types] = await evalArgs(args, ctx);
    if (file && typeof file === 'object' && 'type' in file && Array.isArray(types)) {
        const fileType = (file as { type: string }).type;
        return types.some(t => fileType.includes(String(t)));
    }
    return false;
});

