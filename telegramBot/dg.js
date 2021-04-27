const { Scenes } = require("telegraf");
const { Markup } = require("telegraf");
var libs = process.cwd() + "/lib/";
const fs = require("fs");
const axios = require("axios");
const config = require("config");
var message = require(process.cwd() + "/config/message");
const { table } = require("console");
var trans = require(process.cwd() + "/bot/translator");
const port = config.get("port");
trans = trans.trans;
message = message.message;
var topik = message.topik;
var sender = message.sender;
var recipients = message.recipients;
var language = config.get("language");

var db = require(libs + "db/mongoose");
var User = require(libs + "model/mUser");

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateString(string) {
  var re = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return re.test(string);
}

class SceneGenerator {
  GenMailScene() {
    const mail = new Scenes.BaseScene("mail");
    mail.enter(async (ctx) => {
      await axios({
        method: "get",
        url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
      }).then(async (response) => {
        console.log(response);
        if (response.data.length == 0) {
          await axios({
            method: "post",
            url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
          }).then(async (response) => {
            console.log(response);
            await new User({
              mail: response.data.email,
              userId: ctx.message.from.id,
            }).save(function (err, user) {
              if (!err) {
                console.log("Create new user - %s", user.mail);
              } else {
                console.log(err);
              }
            });
            await ctx.reply(
              trans("Welcome! Your default address is: ", language) +
                response.data.email
            );
            await ctx.scene.leave();
          });
        } else {
          await ctx.reply(
            trans("Welcome! Your default address is: ", language) +
              response.data[0]
          );
          await ctx.scene.leave();
        }
      });
    });
    return mail;
  }
  ChooseEmailScene() {
    const choose = new Scenes.BaseScene("choose");
    choose.enter(async (ctx) => {
      var emails_keyboard = [];
      await axios({
        method: "get",
        url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
      }).then(async (response) => {
        console.log(response);
        response.data.forEach((el) => {
          choose.action(el, async (ctx) => {
            await ctx.deleteMessage();
            await ctx.reply(trans("Sender: ", language) + el);
            sender = el;
            await ctx.scene.enter("emal");
          });
          emails_keyboard.push([{ text: el, callback_data: el }]);
        });
      });
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans(
          "Please choose the address you want to send the message from:",
          language
        ),
        {
          reply_markup: {
            inline_keyboard: [
              ...emails_keyboard,
              [{ text: trans("Cancel", language), callback_data: "cancel" }],
            ],
          },
        }
      );
    });
    choose.on("message", async (ctx) => {
      await ctx.reply(
        trans("Error while setting the 'From' address. Try Again:", language)
      );
      await ctx.scene.reenter();
    });
    choose.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Sending Email: cancelled", language));
      await ctx.scene.leave();
    });
    return choose;
  }
  SelectEmailsScene() {
    const email = new Scenes.BaseScene("emal");
    email.enter(async (ctx) => {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans(
          "Please enter the recipients of your message (up to 10 addresses):",
          language
        ),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: trans("Cancel Sending", language),
                  callback_data: "cancel",
                },
              ],
            ],
          },
        }
      );
    });
    email.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Sending Email: cancelled", language));
      await ctx.scene.leave();
    });
    email.on("text", async (ctx) => {
      var isValid = false;
      const emails = ctx.message.text.split(",");
      for (let i = 0; i < emails.length; i++) {
        isValid = validateEmail(emails[i].trim());
        if (!isValid) {
          break;
        }
      }
      if (isValid) {
        await ctx.reply(trans("Recipients: ", language) + ctx.message.text);
        recipients = ctx.message.text;
        await ctx.scene.enter("subject");
      } else {
        await ctx.reply(trans("Invalid email address", language));
        await ctx.scene.reenter();
      }
    });
    email.on("message", async (ctx) => {
      if (!ctx.message.text) {
        await ctx.reply(
          trans("Error while setting the Recipients. Try Again:", language)
        );
        await ctx.scene.reenter();
      }
    });
    return email;
  }
  EnterSubjectScene() {
    const subject = new Scenes.BaseScene("subject");
    subject.enter(async (ctx) => {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans("Please enter the subject of your message:", language),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: trans("Continue Without Subject", language),
                  callback_data: "noSubject",
                },
              ],
              [
                {
                  text: trans("Cancel Sending", language),
                  callback_data: "cancel",
                },
              ],
            ],
          },
        }
      );
    });
    subject.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Sending Email: cancelled", language));
      await ctx.scene.leave();
    });
    subject.action("noSubject", async (ctx) => {
      topik = "";
      await ctx.scene.enter("body");
    });
    subject.on("text", async (ctx) => {
      topik = ctx.message.text;
      await ctx.scene.enter("body");
    });
    subject.on("message", async (ctx) => {
      if (!ctx.message.text) {
        await ctx.reply(
          trans("Error while setting the Subject. Try Again:", language)
        );
        await ctx.scene.reenter();
      }
    });
    return subject;
  }
  EnterBodyScene() {
    const body = new Scenes.BaseScene("body");
    body.enter(async (ctx) => {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans(
          "Please enter the body of your message (you may send multiple messages).\nSupporting types: text, document, audio, animation, photo, video, voice, video_note.\nPress 'Send' button when you done:",
          language
        ),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: trans("Send Email", language),
                  callback_data: "send",
                },
              ],
              [
                {
                  text: trans("Cancel Sending", language),
                  callback_data: "cancel",
                },
              ],
            ],
          },
        }
      );
    });
    body.on("text", (ctx) => {
      message += ctx.message.text + "\n";
      ctx.scene.enter("addBody");
    });
    body.on("message", async (ctx) => {
      if (ctx.message.sticker) {
        ctx.reply(
          trans(
            "Error while parsing the email part or the attachment type is not supported!",
            language
          )
        );
        ctx.scene.enter("addBody");
      } else {
        // TODO добавить возможность отправления document, audio, animation, photo, video, voice, video_note
        ctx.reply(trans("I can only send text", language));
        ctx.scene.enter("addBody");
      }
    });
    body.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Sending Email: cancelled", language));
      message = "";
      topik = "";

      await ctx.scene.leave();
    });
    body.action("send", async (ctx) => {
      await ctx.reply(
        trans("Your message:\nSender: ", language) +
          sender +
          trans("\nRecipients: ", language) +
          recipients +
          trans("\nSubject: ", language) +
          topik +
          trans("\nMessage:\n", language) +
          message
      );
      await ctx.reply(trans("Your Email is Queued!", language));
      // TODO отправить на почту сообщение
      message = "";
      topik = "";
      await ctx.scene.leave();
    });
    return body;
  }
  AddBodyScene() {
    const addBody = new Scenes.BaseScene("addBody");
    addBody.enter(async (ctx) => {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans("You may send your message or add some text or files!", language),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: trans("Send Email", language),
                  callback_data: "send",
                },
              ],
              [
                {
                  text: trans("Cancel Sending", language),
                  callback_data: "cancel",
                },
              ],
            ],
          },
        }
      );
    });
    addBody.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Sending Email: cancelled", language));
      message = "";
      topik = "";
      await ctx.scene.leave();
    });
    addBody.action("send", async (ctx) => {
      await ctx.reply(
        trans("Your message:\nSender: ", language) +
          sender +
          trans("\nRecipients: ", language) +
          recipients +
          trans("\nSubject: ", language) +
          topik +
          trans("\nMessage:\n", language) +
          message
      );
      await ctx.reply(trans("Your Email is Queued!", language));
      // TODO отправить на почту сообщение
      message = "";
      topik = "";
      await ctx.scene.leave();
    });
    addBody.on("text", (ctx) => {
      message += ctx.message.text + "\n";
      ctx.scene.reenter();
    });
    addBody.on("message", async (ctx) => {
      if (ctx.message.sticker) {
        ctx.reply(
          trans(
            "Error while parsing the email part or the attachment type is not supported!",
            language
          )
        );
        ctx.scene.enter("addBody");
      } else {
        // TODO добавить возможность отправления document, audio, animation, photo, video, voice, video_note
        ctx.reply(trans("I can only send text", language));
        ctx.scene.reenter();
      }
    });
    return addBody;
  }

  GetAddressesScene(emails) {
    const addresses = new Scenes.BaseScene("addresses");
    addresses.enter(async (ctx) => {
      await axios({
        method: "get",
        url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
      }).then(async (response) => {
        console.log(response);
        var replyAddrs = "";
        if (response.data.length > 1) {
          for (let i = 1; i < response.data.length; i++) {
            replyAddrs += (await response.data[i]) + "\n";
          }
        }
        await ctx.reply(
          trans("Default address: ", language) +
            response.data[0] +
            "\n---\n" +
            replyAddrs.substring(0, replyAddrs.length - 1) +
            trans(
              "\n---\nYou may create a new address using /register command and delete existing one using /release command",
              language
            )
        );
        await ctx.scene.leave();
      });
    });
    return addresses;
  }

  RegisterScene() {
    const register = new Scenes.BaseScene("register");
    register.enter(async (ctx) => {
      await axios({
        method: "post",
        url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
      }).then(async (response) => {
        console.log(response);
        ctx.reply(
          trans("E-mail address ", language) +
            response.data.email +
            trans(" successfuly registered!", language)
        );
        ctx.scene.leave();
      });
    });
    return register;
  }

  // RegisterScene() {
  //   const register = new Scenes.BaseScene("register");
  //   register.enter(async (ctx) => {
  //     await ctx.telegram.sendMessage(
  //       ctx.chat.id,
  //       trans(
  //         "Please enter a new username (just a left part of address):",
  //         language
  //       ),
  //       {
  //         reply_markup: {
  //           inline_keyboard: [
  //             [{ text: trans("Cancel", language), callback_data: "cancel" }],
  //           ],
  //         },
  //       }
  //     );
  //   });
  //   register.action("cancel", async (ctx) => {
  //     await ctx.deleteMessage();
  //     await ctx.reply(trans("Register new username: cancelled", language));
  //     await ctx.scene.leave();
  //   });
  //   register.on("text", async (ctx) => {
  //     if (!validateString(ctx.message.text)) {
  //       await axios({
  //         method: "post",
  //         url: `http://mail.enotybot.ru:3000/mail/${ctx.message.text}`
  //       }).then(async (response) => {
  //         console.log(response);
  //       });
  //       await ctx.reply(
  //         trans("Success, name ", language) +
  //           ctx.message.text +
  //           trans(
  //             "registered!\nYou may view all your addresses using a /addresses command",
  //             language
  //           )
  //       );
  //       await ctx.scene.leave();
  //     } else {
  //       await ctx.reply(trans("Name is invalid\nRetry your input:", language));
  //       await ctx.scene.reenter();
  //     }
  //   });
  //   register.on("message", async (ctx) => {
  //     if (!ctx.message.text) {
  //       await ctx.reply(
  //         trans("Error while adding new Email. Try Again:", language)
  //       );
  //       await ctx.scene.reenter();
  //     }
  //   });
  //   return register;
  // }

  ReleaseScene() {
    const release = new Scenes.BaseScene("release");
    release.enter(async (ctx) => {
      var emails_keyboard = [];
      await axios({
        method: "get",
        url: `http://mail.enotybot.ru:3000/mail/${ctx.message.from.id}`,
      }).then(async (response) => {
        console.log(response);
        response.data.forEach((el) => {
          release.action(el, async (ctx) => {
            await axios({
              method: "delete",
              url: `http://mail.enotybot.ru:3000/mail/${el}`,
            }).then(async (response) => {
              await ctx.deleteMessage();
              await ctx.reply(
                trans("Success, name ", language) +
                  el +
                  trans(
                    " deleted!\nYou may view all your addresses using a /addresses command",
                    language
                  )
              );
              await ctx.scene.leave();
            });
          });
          emails_keyboard.push([{ text: el, callback_data: el }]);
        });
      });
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans("Please choose the address you want to release:", language),
        {
          reply_markup: {
            inline_keyboard: [
              ...emails_keyboard,
              [{ text: trans("Cancel", language), callback_data: "cancel" }],
            ],
          },
        }
      );
    });
    release.on("message", async (ctx) => {
      await ctx.reply(
        trans("Error while releasing Email. Try Again:", language)
      );
      await ctx.scene.reenter();
    });
    release.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Releasing Email: cancelled", language));
      await ctx.scene.leave();
    });
    return release;
  }

  // ReleaseScene() {
  //   const release = new Scenes.BaseScene("release");
  //   release.enter(async (ctx) => {
  //     await ctx.telegram.sendMessage(
  //       ctx.chat.id,
  //       trans(
  //         "Please enter username you want to release (just a left part of address):",
  //         language
  //       ),
  //       {
  //         reply_markup: {
  //           inline_keyboard: [
  //             [{ text: trans("Cancel", language), callback_data: "cancel" }],
  //           ],
  //         },
  //       }
  //     );
  //   });
  //   release.action("cancel", async (ctx) => {
  //     await ctx.deleteMessage();
  //     await ctx.reply(trans("Release username: cancelled", language));
  //     await ctx.scene.leave();
  //   });
  //   release.on("text", async (ctx) => {
  //     if (!validateString(ctx.message.text)) {
  //       if (emails.includes(ctx.message.text + "@demo.com")) {
  //         const index = await emails.indexOf(ctx.message.text + "@demo.com");
  //         await emails.splice(index, 1);
  //         fs.writeFileSync(
  //           "./config/email.json",
  //           `{"emails":${JSON.stringify(emails)}}`
  //         );
  //         await ctx.reply(
  //           trans("Success, name ", language) +
  //             ctx.message.text +
  //             trans(
  //               "deleted!\nYou may view all your addresses using a /addresses command",
  //               language
  //             )
  //         );
  //         await ctx.scene.leave();
  //       } else {
  //         await ctx.reply(
  //           trans("Error, the name is not owned by you. Try again:", language)
  //         );
  //         await ctx.scene.reenter();
  //       }
  //     } else {
  //       await ctx.reply(
  //         trans("Error, the name is not owned by you. Try again:", language)
  //       );
  //       await ctx.scene.reenter();
  //     }
  //   });
  //   release.on("message", async (ctx) => {
  //     if (!ctx.message.text) {
  //       await ctx.reply(
  //         trans("Error while releasing Email. Try Again:", language)
  //       );
  //       await ctx.scene.reenter();
  //     }
  //   });
  //   return release;
  // }

  SelectLanguageScene() {
    const lang = new Scenes.BaseScene("lang");
    lang.enter(async (ctx) => {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        trans("Choose language:", language),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: trans("English", language),
                  callback_data: "eng",
                },
              ],
              [
                {
                  text: trans("Russian", language),
                  callback_data: "rus",
                },
              ],
              [{ text: trans("Cancel", language), callback_data: "cancel" }],
            ],
          },
        }
      );
    });
    lang.action("eng", async (ctx) => {
      language = "eng";
      ctx.reply("Change language: selected EN");
      ctx.scene.leave();
    });
    lang.action("rus", async (ctx) => {
      language = "rus";
      ctx.reply("Язык изменен: Выбран РУ");
      ctx.scene.leave();
    });
    lang.action("cancel", async (ctx) => {
      await ctx.deleteMessage();
      await ctx.reply(trans("Change language: cancelled", language));
      await ctx.scene.leave();
    });
    lang.on("message", async (ctx) => {
      await ctx.reply(
        trans(
          "Unknown language or incorrect input, retry your input:",
          language
        )
      );
      await ctx.scene.reenter();
    });
    return lang;
  }

  // GetMessagesScene(app) {
  //   var server = "";
  //   const wait = new Scenes.BaseScene("wait");
  //   wait.enter(async (ctx) => {
  //     await ctx.telegram.sendMessage(
  //       ctx.chat.id,
  //       trans("Waiting for messages...", language),
  //       {
  //         reply_markup: {
  //           inline_keyboard: [
  //             [
  //               {
  //                 text: trans("Cancel", language),
  //                 callback_data: "cancel",
  //               },
  //             ],
  //           ],
  //         },
  //       }
  //     );

  //     app.post("/mail", async function (req, res) {
  //       await ctx.reply(`Вам сообщение:\n${req.body.message}`);
  //       await res.send(`Message:\n${req.body.message}\nhas been recieved`);
  //     });

  //     server = app.listen(port, () => {
  //       console.log(`listening on port ${port}`);
  //     });
  //   });
  //   wait.action("cancel", async (ctx) => {
  //     await server.close();
  //     await ctx.deleteMessage();
  //     await ctx.reply(trans("Waiting for messages: cancelled", language));
  //     await ctx.scene.leave();
  //   });
  //   wait.on("message", async (ctx) => {
  //     await ctx.reply(
  //       trans("Press Cancel button if you want to exit waiting", language)
  //     );
  //     await ctx.scene.reenter();
  //   });
  //   return wait;
  // }
}

module.exports.SceneGenerator = SceneGenerator;
