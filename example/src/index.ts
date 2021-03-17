import admin from "firebase-admin";
import { Consumer } from "../src/Consumer";
import { switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";

admin.initializeApp({
  credential: admin.credential.cert({
    // @ts-ignore
    type: "service_account",
    project_id: "npos-288513",
    private_key_id: "6517b925fb83ab99b8b8248cebba84b76cbaa405",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6xiOW0fMtqv/2\nRBYNO/P4sRgok/dKxzsRbaazLVaQ9mUPNCUCLE6BCBUKB18CO3KZ61LYMkENUpnF\nlDPyvmugEKTiOLt2CHfRtFHyz+KBvvjZ5N+vMOBSa1pqzqjqawRRIW5h73IQvv5l\nH58Le0/ssfRI7yABWUGwX+/6ZK6fY+5WL420B8WfqjBbQ6Iq1y8+YoORIfsmHva0\ntdtnQhcU6FwvWIV3CO73lWeILDKWtjYOC6qeKWI7tRTaXpE+ySmXUAEFrj6eJDgN\nHaAkCi6ciTgiE7ZTBtcNgb2QwwZBEW+Ysfal2B9ehkT8DqTrw7s9afpaNzTX502q\nK9BB2ASPAgMBAAECgf9DlwLcWrBKn6mTrBAFugfrnCrrFqDnN+jxd/PJUWgUn/GE\nxdoMb0VnR+DniVWhsAZI9mAW3PQ/8Ej+t0fMNUF0T/9bTCyKwTybJwGlgbobFVyL\nNKO+Hd+iPRKySxdDdMAI5UcfKeMvvoC/F6AbULuJbJOfPun6t4kgXQVEYQaHXhWx\nsaj1zVINeuFbx2s6ze5zsm/61L3F0LaaVZOxN/bKlequd5Nc0Ky54Pfq1elaYROm\nLhMxm3/579ez3BqreA22j/D9HPz/1hyBvBq/KHSuIgZaeADEHg2b75M73cUTbBQh\nhFuDo/nyuL65i9uCot1iva+DqUqXbFJcnr470i0CgYEA8pjR1kZmkPYISwq25TRD\n3AQWv5WVNjqq26YkNVYq/T7T0t0jb63LIouQnkqSxftiM68R80nQ1LUr3m6dO4yH\ncIJ+rtsooBaf6tYq2gO07ZfUFWRbw64F8kipMrlMG4Goi3m004Wmxv3MGIaBB1CF\ng7CtTjETXMEajq6hEOHI4tMCgYEAxRfI5sSUyOaU20zBEQW/r0mIqp/RCxjkQWCM\nBSE/hsL+pQFn4+zfvktNrGUGQgs6WL6WNc2f3Qj7Ah/+qU2WxJ5EjtFadPdSpqpx\n+RniNwEbZ0Twy4G8HPzuiMsxCOi5MSY5kS05qUFjlTfCFqPx+rJXaumcyDE/dyOS\nv2JyqdUCgYB3Bwn1oycRutVI1GH2RVWCLrNmnqLOL6zDBlo/nR6MkHXnwL5xPgkr\n0uRK9fXbk8KT7zLUdoQyyQ1UHlug6wtM5Yn4iuj82vztgNUXkLgF1vek40+uy8R5\nIrN5grbXzB8BB97z5WB1w/KOmffWueg4O8hcU/HXEZvRI9c87DrfJwKBgQCvgAdn\n3cIyxofkYwtD0h+mwU7NyDOHsymFQahM5RdBM582ZPMSlRmCxGEs0mRpKMBSx5rP\n3AKu+tEwSjckoK9Q8zFPDwKCRry1Je8JBlBV9Elngo78V9Ce62aoLm7CZSCKsGPw\nbxn6Kfy3oYfVSzUsq+OFkvIFnTzLJMUGYG6D5QKBgQCKI1dpL3bzkS9Ed2vOHyKh\nI+gN2uqIEVhf8kmjTsgxelpyLuTDFcCV6DFJsUsSofx/LFutbNv0S+rnk5w0PSp4\nzLy7wm2dfckxgDbqhIk91mjckjkooieEV15irCVOU0Kc4giprGE3qtb5XHeJFBFk\nElN/psvr7mpWENYUwzvvOA==\n-----END PRIVATE KEY-----\n",
    client_email: "terraform@npos-288513.iam.gserviceaccount.com",
    client_id: "114620099839699995202",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/terraform%40npos-288513.iam.gserviceaccount.com",
  }),
  databaseURL: "https://novitus-ncloud-development.firebaseio.com/",
});

new Consumer({
  id: "tester-1",
  removeAfterApply: false,
  live: true,
  ref: admin
    .database()
    .ref("organizations/39d089f5-64a0-4bf7-8135-609ad3a57047"),
})
  .stream(($) => $.pipe(tap(console.log)))
  .subscribe(
    (event) => console.log("next", event.id),
    (error) => console.log("error", error),
    () => console.log("consumer close")
  );
