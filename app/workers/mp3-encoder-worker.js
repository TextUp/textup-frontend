/* global self */

// Borrows heavily from: https://github.com/kaliatech/web-audio-recording-tests/blob/master/src/shared/encoder-mp3-worker.js
// which also borrows heavily from the lamejs source: https://github.com/zhuker/lamejs/blob/master/worker-example/worker-realtime.js

const SAMPLE_BATCH_SIZE = 1152,
  CHANNELS_MONO = 1,
  KB_PER_SECOND = 96,
  DEFAULT_SAMPLE_RATE = 44100;
let resultArrays = [], // array of `Int8Array`s
  mp3Encoder;

self.onmessage = function(e) {
  if (!e.data) {
    return;
  }
  if (e.data[0] === 'init') {
    init(e.data[1]);
  } else if (e.data[0] === 'encode') {
    encode(e.data[1]);
  } else if (e.data[0] === 'dump') {
    // https://stackoverflow.com/a/50842484
    const dataToReturn = dump(); // array of `Int8Array`s
    if (dataToReturn) {
      // pass the buffers of the typed arrays because ArrayBuffers are transferrable types
      self.postMessage(dataToReturn, dataToReturn.map(typedArray => typedArray.buffer));
    }
  } else if (e.data[0] === 'close') {
    cleanup();
  }
};

function init(sampleRate = DEFAULT_SAMPLE_RATE) {
  const rate = parseInt(sampleRate);
  if (isNaN(rate)) {
    throw new Error('Must provide a sample rate that is a valid positive integer');
  }
  if (!self.hasOwnProperty('lamejs')) {
    importScripts('/workers/encoders/lame.min.js'); // eslint-disable-line
  }
  mp3Encoder = new self.lamejs.Mp3Encoder(CHANNELS_MONO, rate, KB_PER_SECOND);
}

function encode(dataChunk) {
  if (!dataChunk || !mp3Encoder) {
    return;
  }
  const samples16BitInt = float32ToInt16Array(dataChunk);
  let remainingSamples = samples16BitInt.length;
  for (let i = 0; remainingSamples >= 0; i += SAMPLE_BATCH_SIZE) {
    const thisBatch = samples16BitInt.subarray(i, i + SAMPLE_BATCH_SIZE);

    addToResults(mp3Encoder.encodeBuffer(thisBatch));
    remainingSamples -= SAMPLE_BATCH_SIZE;
  }
}

function dump() {
  if (!mp3Encoder) {
    return;
  }
  addToResults(mp3Encoder.flush());
  return extractAndClearResults();
}

function cleanup() {
  self.close();
}

// Helpers
// -------

function addToResults(data) {
  if (data.length > 0) {
    // lamejs encoding takes in 16-bit integer array as input and outputs 8-bit integer array
    // see https://github.com/zhuker/lamejs/blob/bfb7f6c6d7877e0fe1ad9e72697a871676119a0e/worker-example/worker-realtime.js#L16
    resultArrays.push(new window.Int8Array(data));
  }
}

function extractAndClearResults() {
  const dataToReturn = resultArrays;
  resultArrays = [];
  return dataToReturn;
}

function float32ToInt16Array(floatData) {
  const input = new window.Float32Array(floatData),
    output = new window.Int16Array(floatData.length);
  for (let i = 0; i < input.length; i++) {
    // the Web Audio API returns an AudioBuffer that is a "32bits floating point buffer, with each
    // sample between -1.0 and 1.0". Therefore our input is a floating point number that is
    // between -1.0 and 1.0. The code below just makes sure that all values are within this range
    // see https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
    const floatingNum = Math.max(-1, Math.min(1, input[i]));

    // Our goal output is a signed 16-bit integer. That is our output is a 16-bit integer that is
    // between -1 * (2^15 - 1) and 2^15 - 1.
    // In two's complement representation,
    //    -1 * (2^15 - 1) = 1000 0000 0000 0000 = 0x8000 = -32768
    //    (2^15 - 1) = 0111 1111 1111 1111 = 0x7fff = 32767
    // In this representation, the smallest value is 0x8000 and you gradually add from this smallest
    // number back to "0", which is 0000 0000 0000 0000. Therefore what we think of as "-1"
    // is actually 1111 1111 1111 1111.
    //
    // If using unsigned integers, then 0x8000 = 32768 and 0x7fff = 32767. Two's complement, described
    // earlier, basically repurposes the top part of this range for negative numbers such that 0x8000
    // is now the smallest negative number (-32768) and 0xFFFF is now -1 instead of 65535 if unsigned.
    //
    // Therefore, if we want to map the floating point range -1.0 to 1.0 onto the signed integer range
    // -32768 to 32767, we just need to multiple the negative floating points by 32768 and the
    // positive floating points by 73267. Javascript numbers are represented internally as 64 bit binary
    // (see http://2ality.com/2012/04/number-encoding.html). Therefore, we can write 0x8000 and this will
    // be treated as +32768 instead of -32768 because we are working in 64-bit binary NOT
    // two's complement integers.
    //
    // see https://stackoverflow.com/a/15094612
    output[i] = floatingNum < 0 ? floatingNum * 0x8000 : floatingNum * 0x7fff;
  }

  return output;
}
