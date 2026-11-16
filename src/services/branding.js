import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase';

export const brandingRef = doc(firestore, 'posConfig', 'branding');

export function watchBrandName(onChange) {
  return onSnapshot(brandingRef, snapshot => {
    onChange(snapshot.data()?.brandName);
  }, () => onChange(undefined));
}
