

import { Injectable, signal } from '@angular/core';
import { db } from '../firebase';

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
  // FIX: Use v8 compat API to get a document reference.
  private docRef = db.collection('portfolio').doc('main');

  constructor() {
    // FIX: Use onSnapshot method from the document reference (v8 compat API).
    this.docRef.onSnapshot( 
      (docSnap) => {
        // FIX: Use the `exists` property instead of the `exists()` method (v8 compat API).
        if (docSnap.exists) {
          const data = docSnap.data();
          if (data) {
            // Merge Firestore data with default data to ensure all fields are present
            // and prevent runtime errors on undefined properties.
            const safeData: PortfolioData = {
              ...this.defaultData,
              ...data,
              contact: {
                ...this.defaultData.contact,
                ...(data.contact || {}),
              },
              skills: Array.isArray(data.skills) ? data.skills : this.defaultData.skills,
              profilePicture: data.profilePicture !== undefined ? data.profilePicture : this.defaultData.profilePicture,
            };
            this.portfolioData.set(safeData);
          }
        } else {
          // Document doesn't exist, create it with default data
          console.log("No portfolio document found. Creating one with default data.");
          // FIX: Use the `set` method on the document reference (v8 compat API).
          this.docRef.set(this.defaultData);
          this.portfolioData.set(this.defaultData);
        }
      },
      (error) => {
        console.error("Error fetching portfolio data:", error);
      }
    );
  }

  async updateData(newData: PortfolioData): Promise<void> {
    // FIX: Use the `set` method on the document reference (v8 compat API).
    await this.docRef.set(newData, { merge: true });
  }
}
