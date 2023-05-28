import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from './environments/environment';
const app = initializeApp(environment);
const db = getFirestore(app);

export {
    db
}