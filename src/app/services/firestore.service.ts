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

    /**
     * Doc Stream
     * @param ref
     * Provides a document observable with ID included
     */
    doc$<T>(ref: DocPredicate<T>): Observable<T> {
        return this.doc(ref).snapshotChanges().pipe(map(doc => {
            const data = doc.payload.data() as T;
            data['uid'] = doc.payload.id;
            return data;
        }));
    }

    /**
     * Collection Stream
     * @param ref 
     * @param queryFn 
     * Provides a collection stream
     */
    col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
        return this.col(ref, queryFn).snapshotChanges().pipe(map(docs => {
            return docs.map(a => a.payload.doc.data()) as T[];
        }));
    }

    /**
     * Timestamp
     * a firebase correct timestamp
     */
    get timestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    /**
     * Update
     * @param ref 
     * @param data 
     * updates a document based on a path
     * Rewrites the correct updated timestamp
     */
    update<T>(ref: DocPredicate<T>, data: any) {
        return this.doc(ref).update({
            ...data,
            updatedAt: this.timestamp
        }).then((res) => {
            return res;
        });
    }

    /**
     * Set
     * @param ref 
     * @param data 
     * Adds a new document from a path
     * Includes the created and updated timestamp automaticallt for every document
     */
    set<T>(ref: DocPredicate<T>, data: any) {
        const timestamp = this.timestamp;
        return this.doc(ref).set({
            ...data,
            updatedAt: timestamp,
            createdAt: timestamp
        }).then((res) => {
            return res;
        });
    }

    /**
     * Add
     * @param ref 
     * @param data 
     * Adds a new document from a path to a collection
     * Includes the created and updated timestamp automaticallt for every item
     */
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

    /**
     * Delete
     * @param ref
     * Deletes a document based on a path
     */
    delete<T>(ref: DocPredicate<T>) {
        return this.doc(ref).delete();
    }

    /**
     * Upsert
     * @param ref 
     * @param data 
     * Either updates a current document
     * or will add a new one if it isnt present
     */
    upsert<T>(ref: DocPredicate<T>, data: any) {
        const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise();

        return doc.then(snap => {
            return snap.payload.exists ? this.update(ref, data) : this.set(ref, data);
        });
    }

    /**
     * Collection with ID
     * @param ref 
     * @param queryFn 
     * Provides a collection stream with ID's mapped into the data
     */
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
