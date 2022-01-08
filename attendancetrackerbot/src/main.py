#Credits to https://github.com/eternnoir/pyTelegramBotAPI/blob/master/examples/reply_keyboard_markup_example.py for reference code in creation of the bot user interface

#Note: you will need to run pip install requests and pip install pyTelegramBotAPI prior to running this bot
import telebot
from telebot.types import ReplyKeyboardMarkup, KeyboardButton
import requests
import constants
import json
import datetime

url = "https://mongo-realm-worker.ulysseskcw96.workers.dev/api/attendance"
headers = {
    'authorization': 'pNWICKgoHIj0SNSxXNBqCdRzXEJ60XRcxjw0kMpEjmuKlprdV2d9OuEbw1RWzh55',
    'Content-Type': 'application/json'
}

TOKEN = constants.TELEGRAM_BOT_API
bot = telebot.TeleBot(TOKEN)

categories = ["Office", "Home"]
office = ["Work from Office", "Out for client meeting"]
home = ["Work from Home", "On Vacation", "Sick Leave"]

alreadySubmittedMessage = "You have already submitted your status for the day"

def getDate():
  now = datetime.date.today()
  nowStr = now.strftime("%d%m%Y")
  print(nowStr)
  return nowStr

def getSender(message):
  chat_id = message.from_user.id
  user_name = message.from_user.first_name
  return chat_id, user_name

  #if message.chat.type == 'private':
    #chat_user = message.chat.first_name
    #chat_userid = message.chat.
  #else:
  #  chat_user = message.chat.title
  


def keyboard(status="Categories"):
  row = []
  markup = ReplyKeyboardMarkup(row_width = 12)
  if status == "Categories":
    row = [KeyboardButton(x) for x in categories]
  elif status == "Office":
    row = [KeyboardButton(x) for x in office]
  elif status == "Home":
    row = [KeyboardButton(x) for x in home]
  else:
    row = [KeyboardButton(x) for x in categories]
  markup.add(*row)
  
  return markup

@bot.message_handler(commands=["start"])
def start_message(message):
    bot.send_message(message.chat.id,"Select a category",reply_markup=keyboard("Categories"))

@bot.message_handler(func=lambda message:True)
def sub_messages(message):
    if message.text == "Office":
        bot.send_message(message.from_user.id,"Select the option that describes your category",reply_markup=keyboard("Office"))
    elif message.text == "Home":
        bot.send_message(message.from_user.id,"Select the option that describes your category",reply_markup=keyboard("Home"))
    elif message.text in office or message.text in home:
        markup = telebot.types.ReplyKeyboardRemove()
        bot.send_message(message.from_user.id,"You have completed your selection",reply_markup=markup)

        # dateStr and telegramID
        userId,name = getSender(message)
        currentDate = getDate()
        details = {'entry': {'name':name, 'status': message.text}}
        newURL = url + "?dateStr=" + currentDate + "&telegramID=" + str(userId)
        res = requests.post(newURL, headers=headers, data = json.dumps(details))
        if res.json() != alreadySubmittedMessage:
            bot.send_message(message.from_user.id, "Successfully submitted!")
        else:
            bot.send_message(message.from_user.id, alreadySubmittedMessage + ' :)')

    else:
        bot.send_message(message.chat.id,message.text)

bot.infinity_polling()
