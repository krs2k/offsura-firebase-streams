import type { DataSnapshot, Reference } from "@firebase/database-types";
import { ConsumerOptions, Cursor, Event } from "./interfaces";
import { concat, from, fromEvent, Observable, of, Subject } from "rxjs";
import {
  catchError,
  concatMap,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import debug from "debug";

export class Consumer {
  public upToDate$: Subject<void>;
  protected stream$: Subject<Event>;
  protected debugger: debug.Debugger;
  protected removeAfterApply: boolean;
  protected id: string;
  protected lastEventId: string;
  protected live: boolean;
  protected ref: Reference;
  protected cursor: Cursor = {
    eventId: null,
    startAt: 0,
  };

  constructor(options: ConsumerOptions) {
    this.ref = options.ref;
    this.removeAfterApply = options.removeAfterApply;
    this.id = options.id;
    this.live = options.live ?? true;
    this.stream$ = new Subject();
    this.upToDate$ = new Subject();
    this.debugger = debug(
      `firebase-streams:consumer[${this.id}][${this.ref.ref}]`
    );
  }

  stream(pipe: ($: Observable<Event>) => Observable<Event[]>) {
    const newEvents$: () => Observable<Event> = () =>
      fromEvent<DataSnapshot>(this.cursorRef(), "child_added").pipe(
        map((snap) => {
          const event: Event = {
            id: snap[0].key,
            ...snap[0].val(),
          };
          return event;
        })
      );

    return from(this.getLastEventId()).pipe(
      switchMap(() =>
        this.loadCursor().pipe(
          tap(() => this.debugger("start", { cursor: this.cursor })),
          switchMap(() => concat(newEvents$())),
          filter((event) => !!event && event.id !== this.cursor.eventId),
          tap((event) => this.debugger("event", event)),
          pipe,
          switchMap((events) => this.ack(events)),
          catchError(async (err) => {
            await this.setError(err);
            throw err;
          }),
          finalize(() => {
            this.debugger("close");
            this.cursorRef().off();
          })
        )
      )
    );
  }

  getLastEventId() {
    return from(
      this.ref
        .child("lastEvent")
        .once("value")
        .then((snap) => (this.lastEventId = snap.val()))
    );
  }

  loadCursor(): Observable<Cursor> {
    return from(
      this.ref
        .child("cursors")
        .child(this.id)
        .once("value")
        .then((snap) => {
          const val = snap.val();
          if (val) {
            this.cursor = val;
          }
          return this.cursor;
        })
    );
  }

  async ack(events: Event[]) {
    if (events.length) {
      const event = events[events.length - 1];
      await this.setCursor(event);
      if (this.removeAfterApply) {
        await this.removeEvent(event);
      }
      if (events.some((e) => e.id === this.lastEventId)) {
        this.upToDate$.next();
        this.upToDate$.complete();
      }
      return event;
    } else {
      this.debugger("missing event in pipe, closing...");
    }
  }

  protected removeEvent(event: Event) {
    return this.ref.child("events").child(event.id).remove();
  }

  protected setCursor(event: Event) {
    this.cursor = {
      eventId: event.id,
      startAt: event.createdAt,
      error: null,
    };
    return this.ref.child("cursors").child(this.id).set(this.cursor);
  }

  protected async setError(error: Error) {
    this.cursor.error = error;
    await this.ref.child("cursors").child(this.id).child("error").set({
      message: error.message,
      stack: error.stack,
    });
    this.debugger("error: " + error.message);
  }

  protected cursorRef() {
    if (this.cursor.eventId) {
      return this.ref.child("events").orderByKey().startAt(this.cursor.eventId);
    } else {
      return this.ref.child("events");
    }
  }
}
