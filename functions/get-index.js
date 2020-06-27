const fs = require("fs");
const Mustache = require("mustache");
const http = require("superagent-promise")(require("superagent"), Promise);
const aws4 = require("aws4");
const URL = require("url");
const awscred = require("awscred");
const { promisify } = require("util");

const restaurantsApiRoot = process.env.restaurants_api;
const ordersApiRoot = process.env.orders_api;
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

let html;

function loadHtml() {
  if (!html) {
    console.log("loading index.html...");
    html = fs.readFileSync("static/index.html", "utf-8");
    console.log("loaded");
  }

  return html;
}

const getRestaurants = async () => {
  const url = URL.parse(restaurantsApiRoot);
  const opts = {
    host: url.hostname,
    path: url.pathname,
  };

  if (!process.env.AWS_ACCESS_KEY_ID){
     const { credentials } = await promisify(awscred.load)();

     process.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId;
     process.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey;
  }

  aws4.sign(opts);

  const httpReq = http
    .get(restaurantsApiRoot)
    .set("Host", opts.headers["Host"])
    .set("X-Amz-Date", opts.headers["X-Amz-Date"])
    .set("Authorization", opts.headers["Authorization"]);

  if (opts.headers["X-Amz-Security-Token"]) {
    httpReq.set("X-Amz-Security-Token", opts.headers["X-Amz-Security-Token"]);
  }

  return (await httpReq).body;
};

module.exports.handler = async (event, context) => {
  const template = loadHtml();
  const restaurants = await getRestaurants();
  const dayOfWeek = days[new Date().getDay()];
  const view = {
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    dayOfWeek,
    restaurants,
    searchUrl: `${restaurantsApiRoot}/search`,
    placeOrderUrl: `${ordersApiRoot}`,
  };
  const html = Mustache.render(template, view);
  const response = {
    statusCode: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
    body: html,
  };

  return response;
};
