const { Telegraf, Scenes, session } = require("telegraf");
const config = require("config");
var libs = process.cwd() + "/lib/";
var log = require(libs + "log")(module);
const bot = new Telegraf(config.get("token"));
var SceneGenerator = require("./bot/scenes");
const curScene = new SceneGenerator.SceneGenerator();
var trans = require("./bot/translator");
trans = trans.trans;

// MONGODB
var db = require(libs + "db/mongoose");
var User = require(libs + "model/mUser");
// /MONGODB

// EXPRESS

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = config.get("port");

app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 10000,
  })
);

app.post("/mail", function (req, res) {
  User.find({ mail: req.body.email }, function (err, docs) {
    // new User({
    //   mail: response.data.email,
    //   userId: ctx.message.from.id
    // }).save(function (err, user) {
    //   if (!err) {
    //     console.log('Create new user - %s', user.mail);
    //   } else {
    //     console.log(err)
    //   }
    // });
    console.log(docs);
  });
});
// mongoClient.connect(function (err, client) {
//   console.log(client);
//   if (err) {
//     console.log(`EROR\n\n\n\n\n\n${err}\n\n\n\n\n\n`);
//   }
//   const db = client.db("usersdb");
//   const collection = db.collection("users");
//   collection.findOne({ email: req.body.email }, async function (err, doc) {
//     // await bot.telegram.sendMessage(12345678, "scheduled message");
//     // await ctx.reply(`Вам сообщение:\n${req.body.message}`);
//     // await res.send(`Message:\n${req.body.message}\nhas been recieved`);
//     console.log(doc);
//     console.log(req);
//     res.send(doc);
//     client.close();
//   });
// });

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// /EXPRESS

bot.use(Telegraf.log());

const mailScene = curScene.GenMailScene();
const sendScene = curScene.ChooseEmailScene();
const selectScene = curScene.SelectEmailsScene();
const subjectScene = curScene.EnterSubjectScene();
const bodyScene = curScene.EnterBodyScene();
const addBodyScene = curScene.AddBodyScene();
const addressesScene = curScene.GetAddressesScene();
const registerScene = curScene.RegisterScene();
const releaseScene = curScene.ReleaseScene();
const languageScene = curScene.SelectLanguageScene();
// const waitScene = curScene.GetMessagesScene(app);

const stage = new Scenes.Stage([
  mailScene,
  sendScene,
  selectScene,
  subjectScene,
  bodyScene,
  addBodyScene,
  addressesScene,
  registerScene,
  registerScene,
  releaseScene,
  languageScene,
  // waitScene,
]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.scene.enter("mail");
});

bot.command("send", async (ctx) => {
  await ctx.scene.enter("choose");
});

bot.command("addresses", async (ctx) => {
  await ctx.scene.enter("addresses");
});

bot.command("register", async (ctx) => {
  await ctx.scene.enter("register");
});

bot.command("release", async (ctx) => {
  await ctx.scene.enter("release");
});

bot.command("lang", async (ctx) => {
  await ctx.scene.enter("lang");
});

bot.command("listen", async (ctx) => {
  await ctx.scene.enter("wait");
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Here are some useful commands:\n/start - personal default address\n/send - send an email\n/addresses - list of registered addresses\n/register - register new address\n/release - delete your existing address\n/help - show help message\n/lang - set language"
  );
});

bot.on("message", async (ctx) => {
  await ctx.reply(
    "Here are some useful commands:\n/start - personal default address\n/send - send an email\n/addresses - list of registered addresses\n/register - register new address\n/release - delete your existing address\n/help - show help message\n/lang - set language"
  );
});

bot.launch();
