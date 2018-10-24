import Ember from 'ember';
import lamejs from 'npm:lamejs';

const { RSVP } = Ember,
  SAMPLE_BATCH_SIZE = 1152;

// TODO need to fix trimming
// // remove the first 2.5 seconds of the recording to remove the "bang" sound that happens
// // when the recorded waves suddenly start. Visually, delay the "loading" state by the same
// // amount of time so that users know to start speaking after a slight delay.
// const SECONDS_TO_TRIM = 2.5;

export function blobToBase64String(blob) {
  return new RSVP.Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      return reject(blob);
    }
    const fr = new FileReader();
    fr.onloadend = () => {
      if (fr.error) {
        reject(fr.error);
      } else {
        resolve(fr.result);
      }
    };
    fr.readAsDataURL(blob);
  });
}

export function compressAudioArrayBuffer(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    return arrayBuffer;
  }
  const wavHeader = lamejs.WavHeader.readHeader(new DataView(arrayBuffer));
  // // TODO trimming the data causes the sample to unpredictably truncate. Figure out how to trim safely
  // // in the future. For now, we'll have to live with the pop for a day or two
  // // const samples = new Int16Array(
  // //     arrayBuffer.slice(amountToTrim),
  // //     wavHeader.dataOffset,
  // //     (wavHeader.dataLen - amountToTrim) / 2
  // //   )
  // // remove the first 2.5 seconds of the recording to remove the "bang" sound that happens
  // // when the recorded waves suddenly start. Visually, delay the "loading" state by the same
  // // amount of time so that users know to start speaking after a slight delay.
  // const amountToTrim = wavHeader.sampleRate * SECONDS_TO_TRIM;
  // if (wavHeader.dataLen < amountToTrim) {
  //   return arrayBuffer;
  // }
  const mp3Encoder = new lamejs.Mp3Encoder(wavHeader.channels, wavHeader.sampleRate, 128),
    resultBuffer = [];
  const samples = new Int16Array(arrayBuffer, wavHeader.dataOffset, wavHeader.dataLen / 2);

  // see https://github.com/zhuker/lamejs/blob/master/example.html
  let remaining = samples.length;
  for (let i = 0; remaining >= SAMPLE_BATCH_SIZE; i += SAMPLE_BATCH_SIZE) {
    let mono = samples.subarray(i, i + SAMPLE_BATCH_SIZE);
    let mp3Buffer = mp3Encoder.encodeBuffer(mono);
    if (mp3Buffer.length > 0) {
      resultBuffer.push(new Int8Array(mp3Buffer));
    }
    remaining -= SAMPLE_BATCH_SIZE;
  }
  let mp3Last = mp3Encoder.flush();
  if (mp3Last.length > 0) {
    resultBuffer.push(new Int8Array(mp3Last));
  }
  return new Blob(resultBuffer, { type: 'audio/mpeg' });
}
