// @ts-ignore
import {QuerySnapshot, DocumentSnapshot} from '@firebase/firestore';

export const parseCollectionSnapshot = (snapshot: QuerySnapshot) => {
  const docs: any[] = [];
  snapshot?.forEach((doc: DocumentSnapshot) => {
    docs.push({
      id: doc.id,
      data: doc.data(),
    });
  });
  return docs;
};
