// ============================================================================
// FILE CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** File size <= max bytes */
export const MAX_FILE_SIZE = (bytes: number): Property => ({
    id: 'maxFileSize',
    type: CONSTRAINT,
    value: op('or', op('isNull', ref(['self', 'value'])), op('lte', op('fileSize', ref(['self', 'value'])), lit(bytes))),
    metadata: {
        message: { id: 'message', type: STRING, value: `File must be smaller than ${(bytes / 1024 / 1024).toFixed(1)}MB` }
    }
});

/** File is an image */
export const IS_IMAGE: Property = {
    id: 'isImage',
    type: CONSTRAINT,
    value: op('or', op('isNull', ref(['self', 'value'])), op('isImage', ref(['self', 'value']))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be an image file' }
    }
};

/** File is a PDF */
export const IS_PDF: Property = {
    id: 'isPdf',
    type: CONSTRAINT,
    value: op('or', op('isNull', ref(['self', 'value'])), op('isPdf', ref(['self', 'value']))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a PDF file' }
    }
};

