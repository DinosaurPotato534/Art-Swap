import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL, listAll } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID!
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const fetchWithCORS = async (url: string) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log("Direct fetch failed, trying with CORS proxy...");
    
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const proxyResponse = await fetch(proxyUrl);
    return await proxyResponse.json();
  }
};

export const saveDrawingToStorage = async (drawingData: any): Promise<{id: string, url: string}> => {
  try {
    const drawingId = uuidv4();
    console.log(`Starting upload to Firebase with ID: ${drawingId}`);

    const drawingRef = ref(storage, `unfinished/${drawingId}.json`);
    
    const jsonData = JSON.stringify(drawingData);
    
    console.log(`Uploading data, size: ${jsonData.length} bytes`);
    await uploadString(drawingRef, jsonData, 'raw');

    const downloadURL = await getDownloadURL(drawingRef);
    console.log(`Upload complete. URL: ${downloadURL}`);

    return {
      id: drawingId,
      url: downloadURL
    };
  } catch (error) {
    console.error("Error saving drawing to Firebase:", error);
    throw error;
  }
};

export const getRandomUnfinishedDrawing = async (excludeId?: string): Promise<{id: string, url: string, data: any} | null> => {
  try {
    console.log("Fetching random unfinished drawing...");
  
    const unfinishedRef = ref(storage, 'unfinished');
    const result = await listAll(unfinishedRef);

    let availableItems = result.items;
    if (excludeId) {
      availableItems = availableItems.filter(item => !item.name.includes(excludeId));
    }

    if (availableItems.length === 0) {
      console.log("No available unfinished drawings found");
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems[randomIndex];

    const id = randomItem.name.replace('.json', '');
    

    const url = await getDownloadURL(randomItem);
    

    const data = await fetchWithCORS(url);
    
    console.log(`Random drawing selected. ID: ${id}`);
    
    return {
      id,
      url,
      data
    };
  } catch (error) {
    console.error("Error getting random unfinished drawing:", error);
    throw error;
  }
};

export const saveFinishedDrawing = async (
  drawingData: any, 
  originalId: string
): Promise<{id: string, url: string}> => {
  try {

    const finishedId = uuidv4();
    console.log(`Saving finished drawing. Original ID: ${originalId}, New ID: ${finishedId}`);

    const drawingRef = ref(storage, `finished/${finishedId}_from_${originalId}.json`);

    const jsonData = JSON.stringify(drawingData);

    await uploadString(drawingRef, jsonData, 'raw');
    
    const downloadURL = await getDownloadURL(drawingRef);
    
    console.log(`Finished drawing saved. URL: ${downloadURL}`);
    
    return {
      id: finishedId,
      url: downloadURL
    };
  } catch (error) {
    console.error("Error saving finished drawing:", error);
    throw error;
  }
};

export const getAllFinishedDrawings = async (): Promise<Array<{id: string, originalId: string, url: string, data: any}>> => {
  try {
    console.log("Fetching all finished drawings...");
    
    const finishedRef = ref(storage, 'finished');
    const result = await listAll(finishedRef);
    
    const drawings = await Promise.all(result.items.map(async (item) => {

      const nameParts = item.name.replace('.json', '').split('_from_');
      const id = nameParts[0];
      const originalId = nameParts[1];

      const url = await getDownloadURL(item);

      const data = await fetchWithCORS(url);
      
      return {
        id,
        originalId,
        url,
        data
      };
    }));
    
    console.log(`Fetched ${drawings.length} finished drawings`);
    return drawings;
  } catch (error) {
    console.error("Error getting finished drawings:", error);
    return [];
  }
};

export { app, storage };
