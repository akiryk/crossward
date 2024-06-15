# Crossward

A crossward puzzle game making tool!

- create a crossword puzzle with hints and answers of your choosing
- save the puzzle for others to use
- play puzzles that others have made

## Background

This is mainly an exploration in how to make a crossword puzzle, more than anything. To see the finished result, visit https://crossward.vercel.app/.

## Developing

In order to develop, you need access to secrets for login and the database. You can create your own:

- Database: [MongoDB](https://cloud.mongodb.com/). You'll need `MONGO_DB_URI` and `MONGO_DB_PASSWORD`.
- Auth: Uses [SveltkitAuth](https://authjs.dev/reference/sveltekit) with Google as provider. You'll need a `GOOGLE_ID` and a `GOOGLE_SECRET`, which you can get by creating credentials at [Google OAuth Client](https://console.cloud.google.com/apis/credentials/oauthclient)

```bash
npm install
npm run dev
```

Visit http://localhost:5173/

## Building

To create a production version of the app:

```bash
npm run build
```
