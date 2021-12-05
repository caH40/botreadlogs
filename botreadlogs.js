require('dotenv').config()
const mongoose = require('mongoose')
const { Schema, model } = require('mongoose')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

//создаем схему
const messageSchema = new Schema({
	message: {
		type: Object
	}
})

//создаем модель из схемы
const Message = model('messages', messageSchema)

//подключаемся к mongodb
mongoose.connect(process.env.MONGODB)
	.then(() => {
		console.log('MongoDb connected..')
	})
	.catch((e) => {
		console.log(e)
	})

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
bot.start(async ctx => {
	await ctx.reply(`Привет! from readlogs ${ctx.message.from.first_name ?? 'Незнакомец'}!`)
})
bot.command('logs', async ctx => {

	await ctx.reply('chose the day', {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: 'BotCurrant', callback_data: 'BotCurrant' }
				]
			]
		}
	})
})

bot.on('callback_query', async ctx => {
	// console.log(ctx.update.callback_query.data)
	if (ctx.update.callback_query.data === 'BotCurrant') {
		async function request() {
			try {
				const logMessage = await Message.find({ "message.text": /^\/\w+/i })
				for (let i = 0; i < logMessage.length; i++) {
					await ctx.reply(`${new Date(logMessage[i].message.date * 1000).toLocaleString()}, ${logMessage[i].message.chat.title ??= 'private'}, ${logMessage[i].message.from.username ??= 'Незнакомец'}, ${logMessage[i].message.text}`)
				}
			} catch (error) {
				console.log('ошибка в запросе данных с базы', error)
			}
		}
		request()
	}
})









bot.launch()
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))