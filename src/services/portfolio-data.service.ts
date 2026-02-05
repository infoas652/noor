
import { Injectable, signal } from '@angular/core';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  profilePicture: string | null;
  contact: {
    email: string;
    phone: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    snapchat: string;
    discord: string;
  };
  skills: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioDataService {
  private defaultData: PortfolioData = {
    name: 'أليكس دو',
    title: 'مهندس واجهات أمامية أول',
    profilePicture: 'https://picsum.photos/256/256',
    bio: 'أنا مهندس واجهات أمامية شغوف ولدي أكثر من 10 سنوات من الخبرة في إنشاء تطبيقات ويب جميلة وسريعة الاستجابة وعالية الأداء. أنا متخصص في Angular و TypeScript ومبادئ تصميم UI/UX الحديثة. هدفي هو بناء منتجات ليست وظيفية فحسب، بل ممتعة في الاستخدام أيضًا.',
    contact: {
      email: 'alex.doe@example.com',
      phone: '+1 (555) 123-4567',
      facebook: 'https://facebook.com/alexdoe',
      instagram: 'https://instagram.com/alexdoe',
      tiktok: 'https://tiktok.com/@alexdoe',
      snapchat: 'https://snapchat.com/add/alexdoe',
      discord: 'https://discord.com/users/alexdoe',
    },
    skills: ['Angular', 'TypeScript', 'RxJS', 'NgRx', 'Tailwind CSS', 'UI/UX Design', 'Figma', 'Jest'],
  };

  private portfolioData = signal<PortfolioData>(this.defaultData);
  public data = this.portfolioData.asReadonly();
  private docRef = doc(db, 'portfolio', 'main');

  constructor() {
    onSnapshot(this.docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          this.portfolioData.set(docSnap.data() as PortfolioData);
        } else {
          // Document doesn't exist, create it with default data
          console.log("No portfolio document found. Creating one with default data.");
          setDoc(this.docRef, this.defaultData);
          this.portfolioData.set(this.defaultData);
        }
      },
      (error) => {
        console.error("Error fetching portfolio data:", error);
      }
    );
  }

  async updateData(newData: PortfolioData): Promise<void> {
    await setDoc(this.docRef, newData, { merge: true });
  }
}
