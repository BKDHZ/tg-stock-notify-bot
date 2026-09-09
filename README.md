📦 TG Stock Notify Bot

一个基于 Cloudflare Workers + Telegram Bot API 的库存通知机器人。

无需服务器、无需数据库，可以直接部署到 Cloudflare Workers。

⸻

✨ 功能

* 📦 库存通知
* 🌍 国家 / 地区
* ➕ 新增库存
* 🟢 剩余库存
* 💰 商品价格
* 🔗 Telegram 购买按钮
* 🖼️ 可选商品图片
* 📱 手机端后台
* ☁️ Cloudflare Workers
* 🔐 后台密码保护
* 🚨 Telegram 错误提示

⸻

🚀 部署

方法一：Cloudflare Dashboard

进入 Cloudflare：

Workers & Pages → Create → Workers

创建一个新的 Worker。

然后上传：

worker.js
wrangler.toml

⸻

🔐 配置环境变量

进入：

Workers → 你的 Worker → Settings → Variables and Secrets

添加以下变量。

BOT_TOKEN

Telegram Bot Token。

例如：

123456789:xxxxxxxxxxxxxxxxxxxxxxxx

建议使用 Secret 保存。

⸻

CHANNEL_ID

Telegram 频道 ID。

例如：

-1001234567890

如果是公开频道，也可以使用：

@your_channel

⸻

ADMIN_PASSWORD

后台登录密码。

例如：

YourStrongPassword123

建议设置一个复杂密码。

⸻

🤖 Telegram Bot 设置

首先通过 Telegram 的 BotFather 创建机器人。

获取：

BOT_TOKEN

然后把机器人添加到你的 Telegram 频道。

机器人需要拥有：

管理员权限

至少需要允许：

发送消息

否则机器人无法向频道发送库存通知。

⸻

🌐 后台地址

部署成功后：

https://你的Worker域名/admin

例如：

https://tg-stock-notify-bot.xxx.workers.dev/admin

打开后输入：

后台密码
国家/地区
新增库存
当前库存
单价
购买链接
商品图片 URL（可选）

然后点击：

🚀 发送库存通知

⸻

📢 Telegram 最终效果

没有图片时：

🟢🟢🟢 库存更新 🟢🟢🟢
【泰国 +66】
📦 添加库存 100 个
💰 单价 ¥6.9
🟢 剩余库存 500 个
[ 🛒 点击购买此商品 ]

填写图片 URL 后，会以 Telegram 图片消息发送，并在图片下方显示库存信息和购买按钮。

⸻

☁️ Wrangler 部署

如果你使用 Wrangler：

安装：

npm install -g wrangler

登录：

wrangler login

部署：

wrangler deploy

设置 Secret：

wrangler secret put BOT_TOKEN

然后输入 Bot Token。

wrangler secret put CHANNEL_ID

然后输入频道 ID。

wrangler secret put ADMIN_PASSWORD

然后输入后台密码。

⸻

📁 项目结构

tg-stock-notify-bot/
│
├── worker.js
├── wrangler.toml
└── README.md

⸻

🔒 安全说明

不要把以下信息直接写进 worker.js：

BOT_TOKEN
ADMIN_PASSWORD

也不要提交到 GitHub。

推荐使用 Cloudflare Secrets：

BOT_TOKEN
CHANNEL_ID
ADMIN_PASSWORD

⸻

🛠️ 常见问题

Telegram 发送失败

检查：

1. BOT_TOKEN 是否正确
2. CHANNEL_ID 是否正确
3. Bot 是否已经加入频道
4. Bot 是否拥有频道管理员权限

⸻

显示 chat not found

通常是：

CHANNEL_ID

填写错误。

可以尝试：

-100xxxxxxxxxx

或者公开频道：

@频道用户名

⸻

显示 bot is not a member of the channel

把机器人添加到频道，并设置为管理员。

⸻

图片发送失败

检查图片 URL 是否：

https://example.com/image.jpg

并确保 Telegram 可以访问这个图片地址。

⸻

📄 License

MIT

:::
### 你现在怎么放
你的仓库：
[BKDHZ/tg-stock-notify-bot](https://github.com/BKDHZ/tg-stock-notify-bot?utm_source=chatgpt.com)
里面最终应该是：
```text
tg-stock-notify-bot
├── worker.js
├── wrangler.toml
└── README.md

**有一点我特别提醒你：你现在原来的 worker.js 已经能工作，但我上面这个版本增加了图片发送，所以如果你想做成你之前截图那种“图片 + 库存信息 + 购买按钮”**的效果，这个版本更合适。

另外，Cloudflare 的“GitHub 一键部署”严格来说有两种方式：连接 GitHub 自动部署，以及 README 里的 Deploy to Cloudflare 按钮。你如果要的是后者，我可以再给你把 真正的 Deploy to Cloudflare 一键按钮补进 README，并按 Cloudflare 当前支持的方式整理好。