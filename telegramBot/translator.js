var trans = function trans(text, lang) {
  if (lang == "eng") {
    return text;
  } else {
    if (text == "Welcome! Your default address is: ") {
      return "Добро пожаловать! Ваш адрес по умолчанию: ";
    }
    if (
      text == "Please choose the address you want to send the message from:"
    ) {
      return "Выберите почту, с которой вы хотите отправить сообщение";
    }
    if (text == "Cancel") {
      return "Отмена";
    }
    if (text == "Sender: ") {
      return "Отправитель: ";
    }
    if (text == "Error while setting the 'From' address. Try Again:") {
      return "Ошибка при выборе адреса Отправителя. Попробуйте снова:";
    }
    if (text == "Sending Email: cancelled") {
      return "Отправка письма отменена";
    }
    if (
      text ==
      "Please enter the recipients of your message (up to 10 addresses):"
    ) {
      return "Введите получателей письма (до 10 адресов):";
    }
    if (text == "Cancel Sending") {
      return "Отменить";
    }
    if (text == "Recipients: ") {
      return "Получатели: ";
    }
    if (text == "Invalid email address") {
      return "Некорректный адрес почты";
    }
    if (text == "Error while setting the Recipients. Try Again:") {
      return "Ошибка при вводе адресов Получателей. Попробуйте снова:";
    }
    if (text == "Please enter the subject of your message:") {
      return "Введите тему сообщения:";
    }
    if (text == "Continue Without Subject") {
      return "Продолжить без темы";
    }
    if (text == "Error while setting the Subject. Try Again:") {
      return "Ошибка при вводе Темы письма. Попробуйте снова:";
    }
    if (
      text ==
      "Please enter the body of your message (you may send multiple messages).\nSupporting types: text, document, audio, animation, photo, video, voice, video_note.\nPress 'Send' button when you done:"
    ) {
      return 'Введите тело письма (можно отправить несколькими сообщениями)\nПоддерживаемые типы: текст, документ, аудио, анимация, фото, видео, голосовое сообщение\nНажмите кнопку "Отправить", когда закончите';
    }
    if (text == "Send Email") {
      return "Отправить";
    }
    if (
      text ==
      "Error while parsing the email part or the attachment type is not supported!"
    ) {
      return "Ошибка при распознавании типа вложения";
    }
    if (text == "I can only send text") {
      return "Пока я могу отправлять только текст";
    }
    if (text == "Your message:\nSender: ") {
      return "Ваше письмо:\nОтправитель: ";
    }
    if (text == "\nRecipients: ") {
      return "\nПолучатели: ";
    }
    if (text == "\nSubject: ") {
      return "\nТема: ";
    }
    if (text == "\nMessage:\n") {
      return "\nСообщение:\n";
    }
    if (text == "Your Email is Queued!") {
      return "Ваше письмо отправлено!";
    }
    if (text == "You may send your message or add some text or files!") {
      return "Вы можете отправить сообщение или добавить текст или файлы";
    }
    if (text == "Default address: ") {
      return "Адрес по умолчанию: ";
    }
    if (
      text ==
      "\n---\nYou may create a new address using /register command and delete existing one using /release command"
    ) {
      return "\n---\nВы можете создать новую почту используя команду /register или удалить существующую почту с помощью команды /release";
    }
    if (text == "Please enter a new username (just a left part of address):") {
      return "Введите новое имя учетной записи (только левую часть адреса)";
    }
    if (text == "Register new username: cancelled") {
      return "Регистрация новой почты отменена";
    }
    if (
      text ==
      "registered!\nYou may view all your addresses using a /addresses command"
    ) {
      return "зарегистрирован!\nТеперь вы можете посмотреть все свои почтовые адреса, используя команду /addresses";
    }
    if (text == "Name is invalid\nRetry your input:") {
      return "Имя некорректно\nПопробуйте снова:";
    }
    if (text == "Error while adding new Email. Try Again:") {
      return "Ошибка при добавлении новой почты. Попробуйте снова:";
    }
    if (
      text ==
      "Please enter username you want to release (just a left part of address):"
    ) {
      return "Введите имя учетной записи, которую хотите удалить (только левую часть адреса)";
    }
    if (text == "Release username: cancelled") {
      return "Удаление учетной записи отменено";
    }
    if (
      text ==
      " deleted!\nYou may view all your addresses using a /addresses command"
    ) {
      return " удален!\nТеперь вы можете посмотреть все свои почтовые адреса, используя команду /addresses";
    }
    if (text == "Error, the name is not owned by you. Try again:") {
      return "Ошибка, это имя пользователя вам не принадлежит. Попробуйте снова";
    }
    if (text == "Error while releasing Email. Try Again:") {
      return "Ошибка при удалении учетной записи. Попробуйте снова:";
    }
    if (text == "Choose language:") {
      return "Выберите язык:";
    }
    if (text == "English") {
      return "Английский";
    }
    if (text == "Russian") {
      return "Русский";
    }
    if (text == "Change language: cancelled") {
      return "Смена языка отменена";
    }
    if (text == "Unknown language or incorrect input, retry your input:") {
      return "Неизвестный язык или некорректный ввод, попробуйте снова:";
    }
    if (
      text ==
      "Here are some useful commands:\n/start - personal default address\n/send - send an email\n/addresses - list of registered addresses\n/register - register new address\n/release - delete your existing address\n/help - show help message\n/lang - set language"
    ) {
      return "Полезные команды:\n/start - личный адрес по умолчанию\n/send - отправить письмо\n/addresses - список зарегестрированных адресов\n/register - зарегистрировать новый адрес\n/release - удалить существующий адрес\n/help - показать возможные команды\n/lang - установить язык";
    }
    if (text == "E-mail address ") {
      return "Электронная почта ";
    }
    if (text == " successfuly registered!") {
      return " успешно зарегистрирована!";
    }
    if (text == "Please choose the address you want to release:") {
      return "Выберите адрес, который вы хотите удалить:";
    }
    if (text == "Releasing Email: cancelled") {
      return "Удаление адреса отменено";
    }
    if (text == "Waiting for messages...") {
      return "Жду сообщений...";
    }
    if (text == "Waiting for messages: cancelled") {
      return "Ожидание сообщений отменено";
    }
    if (text == "Press Cancel button if you want to exit waiting") {
      return "Нижмите кнопку Отменить, если хотите выйти из ожидания";
    }
  }
  return text;
};

module.exports.trans = trans;
