import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { FirebaseApp } from '@angular/fire';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {

    constructor(private afs: AngularFirestore, private fb: FirebaseApp) { }

    col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
        return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
    }

    doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
        return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
    }

    doc$<T>(ref: DocPredicate<T>): Observable<T> {
        return this.doc(ref).snapshotChanges().pipe(map(doc => {
            const data = doc.payload.data() as T;
            data['uid'] = doc.payload.id;
            return data;
        }));
    }

    col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
        return this.col(ref, queryFn).snapshotChanges().pipe(map(docs => {
            return docs.map(a => a.payload.doc.data()) as T[];
        }));
    }

    colValueChanges$(ref: string, queryFn?): Observable<any[]> {
        return this.afs.collection<any>(ref, queryFn).valueChanges();
    }

    get timestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    update<T>(ref: DocPredicate<T>, data: any) {
        return this.doc(ref).update({
            ...data,
            updatedAt: this.timestamp
        }).then(() => {
            return { operation: 'update' };
        });
    }

    set<T>(ref: DocPredicate<T>, data: any) {
        const timestamp = this.timestamp;
        return this.doc(ref).set({
            ...data,
            updatedAt: timestamp,
            createdAt: timestamp
        }).then(() => {
            return { operation: 'update' };
        });
    }

    add<T>(ref: CollectionPredicate<T>, data) {
        const timestamp = this.timestamp;
        return this.col(ref).add({
            ...data,
            updatedAt: timestamp,
            createdAt: timestamp
        }).then(() => {
            return data ;
        });
    }

    delete<T>(ref: DocPredicate<T>) {
        return this.doc(ref).delete();
    }

    upsert<T>(ref: DocPredicate<T>, data: any) {
        const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise();

        return doc.then(snap => {
            return snap.payload.exists ? this.update(ref, data) : this.set(ref, data);
        });
    }

    exists(ref: string) {
        const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise();
        return doc.then(snap => {
            return snap.payload.exists ? snap.payload.data() : false;
        });
    }

    colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<any[]> {
        return this.col(ref, queryFn).snapshotChanges().pipe(map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data();
                data['uid'] = a.payload.doc.id;
                data['doc'] = a.payload.doc;
                return data;
            });
        }));
    }
}
