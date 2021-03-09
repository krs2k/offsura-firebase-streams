import type { Reference } from "@firebase/database-types";
import { Event } from "./interfaces";
import { Subject } from "rxjs";
import { switchMap } from "rxjs/operators";

export class Producer {
  steam$: Subject<Event>;

  constructor(private ref: Reference) {
    this.steam$ = new Subject();
  }

  produce(event: Event) {
    if (!event.data || !Object.keys(event.data).length) {
      console.log("error event: ", event);
      throw new Error("Event.data cannot be empty");
    }
    this.steam$.next(event);
  }

  stream() {
    return this.steam$.pipe(
      switchMap((event) => {
        return this.ref.child("events").push(event);
      })
    );
  }
}
