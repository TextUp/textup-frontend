import Ember from 'ember';
import config from '../config/environment';
import {
    default as EXIF
} from 'npm:exif-js';

const {
    merge,
    copy,
    RSVP: {
        Promise
    },
    isNone
} = Ember, {
    floor,
    ceil,
    max,
    min
} = Math;

// Inspired by https://github.com/rossturner/HTML5-ImageUploader
//     and http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
// Compresses an image to fit dimension and size requirements
//     and reorients an image according to its EXIF metadata information
// Passed an HTMLImageElement and an optional array of options
//     if no options passed, then reverts to defaults set in config
// Returns a HTMLImageElement compressed to fit specifications and the mimeType
//     of the compressed image
function compress(image, options = Object.create(null)) {
    return new Promise((resolve, reject) => {
        if (isNone(image)) {
            return resolve(image);
        }
        const {
            maxSizeInBytes: maxSize,
            maxHeightInPixels: maxH,
            maxWidthInPixels: maxW,
            jpegQuality,
            scalingStep,
            orient: shouldOrient
        } = merge(copy(options), config.photoCompression);
        // create source canvas, reorienting as necessary
        _buildSourceCanvas(image, shouldOrient).then((srcCanvas) => {
            const {
                width: w,
                height: h
            } = srcCanvas;
            // determine scaling factor
            const scaling = _getScaling(w, h, maxW, maxH, maxSize, scalingStep),
                destCanvas = _doScaling(srcCanvas, scaling),
                resultImage = new Image(destCanvas.width, destCanvas.height),
                mimeType = 'image/jpeg';
            resultImage.src = destCanvas.toDataURL(mimeType, jpegQuality);
            resolve([resultImage, mimeType]);
        }, reject);
    });
}

// Orientation helpers
// -------------------

function _buildSourceCanvas(image, shouldOrient) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        if (shouldOrient) {
            ctx.save(); // create a save point
            _transformCanvasToOrientation(canvas, image).then(() => {
                ctx.drawImage(image, 0, 0); // draw on transformed canvas
                ctx.restore(); // restore to obtain re-oriented image
                resolve(canvas);
            }, reject);
        } else {
            ctx.drawImage(image, 0, 0);
            resolve(canvas);
        }
    });
}

function _transformCanvasToOrientation(canvas, image) {
    return new Promise((resolve) => {
        EXIF.getData(image, function() {
            const orientation = EXIF.getTag(this, 'Orientation') || 1,
                ctx = canvas.getContext('2d'),
                {
                    width: w,
                    height: h
                } = canvas;
            if (orientation > 4) {
                canvas.width = h;
                canvas.height = w;
            }
            switch (orientation) {
                case 2:
                    ctx.scale(-1, 1);
                    ctx.translate(-w, 0);
                    break;
                case 3:
                    ctx.scale(-1, -1);
                    ctx.translate(-w, -h);
                    break;
                case 4:
                    ctx.scale(1, -1);
                    ctx.translate(0, -h);
                    break;
                case 5:
                    ctx.scale(1, -1);
                    ctx.rotate(-Math.PI / 2);
                    break;
                case 6:
                    ctx.rotate(Math.PI / 2);
                    ctx.translate(0, -h);
                    break;
                case 7:
                    ctx.scale(-1, 1);
                    ctx.rotate(-Math.PI / 2);
                    ctx.translate(-w, -h);
                    break;
                case 8:
                    ctx.rotate(-Math.PI / 2);
                    ctx.translate(-w, 0);
            }
            resolve(canvas);
        });
    });
}

// Compression helpers
// -------------------

function _getScaling(w, h, maxW, maxH, maxSize, scalingStep) {
    let scaling = 1.0;
    // if (1) estimated size is smaller than the max and
    // (2) both width and height are smaller than the max
    // then we don't need to compress
    const origSize = _estimateSize(w, h);
    if (origSize < maxSize && w < maxW && h < maxH) {
        return scaling;
    }
    // fit within dimension constraints
    if (w > h && w > maxW) {
        scaling = _calculateScaling(w, maxW);
    } else if (h > w && h > maxH) {
        scaling = _calculateScaling(h, maxH);
    }
    // fit within max size constraint
    let scaledSize = _estimateSize(_scale(w, scaling), _scale(h, scaling)),
        correctedStep = min(max(scalingStep, 0.1), 0.9);
    while (scaledSize > maxSize) {
        scaling *= correctedStep;
        scaledSize = _estimateSize(_scale(w, scaling), _scale(h, scaling));
    }
    return scaling;
}

function _doScaling(srcCanvas, scaling) {
    // prepare scaled dimensions and image data objects
    const srcCtx = srcCanvas.getContext('2d'),
        {
            width: w,
            height: h
        } = srcCanvas,
        newW = floor(_scale(w, scaling)), // truncate to avoid floating point dimensions
        newH = floor(_scale(h, scaling)),
        srcData = srcCtx.getImageData(0, 0, w, h),
        destData = srcCtx.createImageData(newW, newH);
    // perform bilinear interpolation to populate destination data array
    // traverse the destination data array along a row, where each cell is a pixel
    // recall that origin is in the upper left corner with +x running right and +y running down
    for (let destRow = 0; destRow < newH; ++destRow) {
        const srcRowMid = _reverse(destRow, scaling), // non-integer value
            srcRowAbove = floor(srcRowMid), // closest row above
            srcRowBelow = ceil(srcRowMid), // closest row below
            rowMidToAbove = srcRowMid - srcRowAbove; // delta between mid and lower
        for (let destCol = 0; destCol < newW; ++destCol) {
            const srcColMid = _reverse(destCol, scaling), // non-integer value
                srcColLeft = floor(srcColMid), // closest col to the left
                srcColRight = ceil(srcColMid), // closest cl to the right
                colMidToLeft = srcColMid - srcColLeft; // delta between mid and lower
            // now that we have the row and col values, get the actual indices of
            // the pixels we are interested in in the dest and source ImageData arrays
            const destIndex = _getIndex(destRow, destCol, newW),
                srcIndexUL = _getIndex(srcRowAbove, srcColLeft, w), // upper left; lower row & lower col
                srcIndexUR = _getIndex(srcRowAbove, srcColRight, w), // upper right; lower row & higher col
                srcIndexLL = _getIndex(srcRowBelow, srcColLeft, w), // lower left; higher row & lower col
                srcIndexLR = _getIndex(srcRowBelow, srcColRight, w); // lower right; higher row & higher col
            // do 4 times because ImageData is a 1D array where a pixel is
            // represented by four indices indicating R, G, B, and alpha.
            for (let i = 0; i < 4; ++i) {
                destData.data[destIndex + i] = _doBilinearInterpolation(srcData,
                    srcIndexUL + i, srcIndexUR + i, srcIndexLL + i, srcIndexLR + i,
                    colMidToLeft, rowMidToAbove);
            }
        }
    }
    // paint populated destination data array onto a scaled canvas
    const destCanvas = document.createElement('canvas');
    destCanvas.width = newW;
    destCanvas.height = newH;
    destCanvas.getContext('2d').putImageData(destData, 0, 0);
    return destCanvas;
}

function _calculateScaling(before, after) {
    return after / before;
}

function _scale(before, scaling) {
    return before * scaling;
}

function _reverse(after, scaling) {
    return after / scaling;
}
// assume an 8-bit PNG of the given dimensions
function _estimateSize(width, height) {
    const bitsPerPixel = 8,
        bitsInAByte = 8;
    return width * height * bitsPerPixel / bitsInAByte;
}

function _doBilinearInterpolation(srcData, srcIndexUL, srcIndexUR, srcIndexLL, srcIndexLR,
    colMidToLeft, rowMidToAbove) {
    const colMidToRight = 1 - colMidToLeft, // unit square since we used floor and ceil
        rowMidToBelow = 1 - rowMidToAbove;
    // we multiply each source pixel by the distance between the midpoint and the
    // opposite row or column because pixels should be more influential the closer
    // the midpoint is to that pixel. Therefore, we multiply by the opposite because
    // if the midpoint is CLOSER to the pixel, then the distance to the opposite will be LARGER
    // and if the midpoint is FURTHER from the pixel, the the distance to the opposite will be SMALLER
    // This inverse relationship fulfills the closer to midpoint = higher weight principle.
    return srcData.data[srcIndexUL] * rowMidToBelow * colMidToRight +
        srcData.data[srcIndexUR] * rowMidToBelow * colMidToLeft +
        srcData.data[srcIndexLL] * rowMidToAbove * colMidToRight +
        srcData.data[srcIndexLR] * rowMidToAbove * colMidToLeft;
}
// get the index in the ImageData array given the pixel row and column
function _getIndex(row, col, w) {
    const cellsPerPixel = 4;
    return ((row * w) + col) * cellsPerPixel;
}

export {
    compress
};