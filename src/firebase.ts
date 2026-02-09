import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { firebaseConfig } from './firebase.config';

const app = firebase.initializeApp(firebaseConfig);
export const firebaseAuth = firebase.auth();
export const db = firebase.firestore();
