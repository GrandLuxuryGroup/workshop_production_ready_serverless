const awscred = require("awscred");
const { promisify } = require("util");


let initialized = false;

const init = async () => {
  if (initialized) {
    return;
  }

  process.env.TEST_ROOT =
    "https://zha96y284l.execute-api.eu-west-1.amazonaws.com/dev";

  process.env.restaurants_api =
    "https://zha96y284l.execute-api.eu-west-1.amazonaws.com/dev/restaurants";
  process.env.restaurants_table = "restaurants-yancui";
  process.env.AWS_REGION = "eu-west-1";
 process.env.cognito_user_pool_id = "eu-west-1_PblAMklAH";
 process.env.cognito_client_id = "6686ukscje8smbfuvdpnepp5o9";
 process.env.cognito_server_client_id = "mjmrlep1nnocs4vkpqd8ibub3";

 const { credentials } = await promisify(awscred.load)();

  process.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey;

  if (credentials.sessionToken) {
    process.env.AWS_SESSION_TOKEN = credentials.sessionToken;
  }

  console.log("AWS credential loaded");

  initialized = true;
};

module.exports = {
  init,
};
