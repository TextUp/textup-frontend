import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { run } = Ember;

export const VALID_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAGFBMVEXMzMyWlpajo6O3t7fFxcWcnJyxsbG+vr50Rsl6AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJklEQVQImWNgwADKDAwsAQyuDAzMAgyMbOYMAgyuLApAUhnMRgIANvcCBwsFJwYAAAAASUVORK5CYII=';
export const VALID_MP3_URL_1 =
  'http://com.twilio.music.electronica.s3.amazonaws.com/teru_-_110_Downtempo_Electronic_4.mp3';
export const VALID_MP3_URL_2 =
  'http://com.twilio.music.electronica.s3.amazonaws.com/Kaer_Trouz_-_Seawall_Stepper.mp3';

export const GOOD_VCARD_DATA =
  'BEGIN:VCARD\nVERSION:3.0\nN:Gump;Forrest;;Mr.;\nFN:Forrest Gump\nTEL;TYPE=WORK,VOICE:(111) 555-1212\nTEL;TYPE=HOME,VOICE:(404) 555-1212\nADR;TYPE=WORK,PREF:;;100 Waters Edge;Baytown;LA;30314;United States of America\nEND:VCARD' +
  'BEGIN:VCARD\nVERSION:3.0\nN:Gump;Forrest;;Mr.;\nFN:Forrest Gump 2\nTEL;TYPE=WORK,VOICE:(111) 555-1212\nADR;TYPE=WORK,PREF:;;100 Waters Edge;Baytown;LA;30314;United States of America\nEND:VCARD';
export const BAD_VCARD_DATA =
  'BEGIN:VCARD\nVERSION:3.0TEL;TYPE=WORK,VOICE:(111) 555-1212\nTEL;TYPE=HOME,VOICE:(404) 555-1212\nADR;TYPE=WORK,PREF:;;100 Waters Edge;Baytown;LA;30314;United States of America\nEND:VCARD';

export function mockInvalidMediaImage(store) {
  return run(() => {
    const mediaImage = store.createFragment('media-element', {
      [Constants.PROP_NAME.MEDIA_ID]: `${Math.random()}`,
    });
    mediaImage.addVersion('image/png', 'not', 350, 88);
    mediaImage.addVersion('image/png', 'valid', 100, 88);
    mediaImage.addVersion('image/png', 'link', 50, 88);

    return mediaImage;
  });
}

export function mockValidMediaImage(store) {
  return run(() => {
    const mediaImage = store.createFragment('media-element', {
      [Constants.PROP_NAME.MEDIA_ID]: `${Math.random()}`,
    });
    mediaImage.addVersion('image/jpeg', 'https://via.placeholder.com/350x150', 350, 88);
    mediaImage.addVersion('image/jpeg', 'https://via.placeholder.com/100x150', 100, 88);
    mediaImage.addVersion('image/jpeg', 'https://via.placeholder.com/50x150', 50, 88);

    return mediaImage;
  });
}

export function mockValidMediaAudio(store) {
  return run(() => {
    const el1 = store.createFragment('media-element', {
      [Constants.PROP_NAME.MEDIA_ID]: `${Math.random()}`,
    });
    el1.addVersion('audio/mpeg', VALID_MP3_URL_1);

    return el1;
  });
}

/* jshint ignore:start */
export function mockModel(id, modelName, otherProps = {}) {
  return Ember.Object.create({ id, constructor: { modelName }, ...otherProps });
}
/* jshint ignore:end */

export function mockRecordClusters(
  store,
  numClusters = 40,
  itemModel = 'record-text',
  itemProps = { contents: 'hi' }
) {
  let clusters = [];
  run(() => {
    clusters = Array(numClusters)
      .fill()
      .map(() => {
        return RecordCluster.create({
          items: [store.createRecord(itemModel, itemProps)],
        });
      });
  });
  return clusters;
}
