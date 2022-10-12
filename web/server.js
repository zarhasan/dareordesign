const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { createRequestHandler } = require("@remix-run/express");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config({
  path: "./.env",
});

const upload = multer({
  storage: multerS3({
    s3: new S3Client({
      region: "auto",
      endpoint: `${process.env.S3_ENDPOINT}`,
      credentials: {
        accessKeyId: `${process.env.S3_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.S3_SECRET_ACCESS_KEY}`,
      },
    }),
    bucket: "dareordesign",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = mime.extensions[file.mimetype][0];
      cb(null, `${file.fieldname}-${uuidv4()}.${ext}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.post(
  "/api/image/upload",
  upload.single("image"),
  function (req, res, next) {
    res.status(200).send({
      key: req.file.key,
      size: req.file.size,
      bucket: req.file.bucket,
      mimetype: req.file.mimetype,
      location: req.file.location,
      etag: req.file.etag,
    });
  }
);

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
