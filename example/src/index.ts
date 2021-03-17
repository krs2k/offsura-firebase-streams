import admin from "firebase-admin";
import {
  bufferCount,
  bufferTime,
  concatMap,
  filter,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { Consumer } from "../../src";
import { Event } from "../../dist";
import { of } from "rxjs";

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json")),
  databaseURL: "https://novitus-ncloud-development.firebaseio.com/",
});

async function main() {
  let i = 0;
  await admin
    .database()
    .ref("organizations/39d089f5-64a0-4bf7-8135-609ad3a57047/cursors/tester-1")
    .remove();
  const consumer = new Consumer({
    id: "tester-1",
    removeAfterApply: false,
    live: false,
    ref: admin
      .database()
      .ref("organizations/39d089f5-64a0-4bf7-8135-609ad3a57047"),
  });

  consumer.upToDate$.toPromise().then(() => console.log("up to date"));
  consumer
    .stream(($) =>
      $.pipe(
        bufferTime(1000),
        filter((events) => !!events.length),
        concatMap(async (events) => {
          let last: Event;
          console.log("buffer", i++, events.length);
          for (let event of events) {
            console.log(event.id, event.isLast);
            last = event;
          }
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return events;
        })
      )
    )
    .subscribe(
      (event) => {},
      (error) => console.log("error", error),
      () => console.log("consumer close")
    );
}
main();
