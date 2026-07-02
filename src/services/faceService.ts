import * as faceapi from 'face-api.js';

const DB_NAME = 'FaceBioDB';
const STORE_NAME = 'user_embeddings';
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export interface UserFaceData {
  userId: string;
  embeddings: number[][]; // Multiple samples for better accuracy
  label: string;
}

class FaceService {
  private modelsLoaded = false;

  async loadModels() {
    if (this.modelsLoaded) return;
    try {
      console.log(`Loading face models from ${MODEL_URL}...`);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      this.modelsLoaded = true;
      console.log('Face models loaded successfully');
    } catch (error) {
      console.error('Error loading face models:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error while fetching models. Check Internet connection or CORS settings.');
      }
      throw error;
    }
  }

  // IndexedDB Methods
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserBiometrics(userId: string, label: string, embeddings: number[][]) {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put({ userId, label, embeddings });
  }

  async getUserBiometrics(userId: string): Promise<UserFaceData | null> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async clearBiometrics(userId: string) {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(userId);
  }

  async getAllBiometrics(): Promise<UserFaceData[]> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // Detection and Comparison
  async getDescriptorFromVideo(video: HTMLVideoElement): Promise<Float32Array | null> {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection ? detection.descriptor : null;
  }

  compareDescriptors(d1: Float32Array | number[], d2: Float32Array | number[]): number {
    // Euclidean distance
    let sum = 0;
    for (let i = 0; i < d1.length; i++) {
      sum += Math.pow((d1[i] as number) - (d2[i] as number), 2);
    }
    const distance = Math.sqrt(sum);
    // distance < 0.6 is typically a good match
    return distance;
  }
}

export const faceService = new FaceService();
