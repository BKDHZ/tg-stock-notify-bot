export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // 首页
    // =========================
    if (url.pathname === "/") {
      return new Response(
        "TG Stock Notify Bot Online\n\n/admin",
        {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        }
      );
    }

    // =========================
    // 后台管理页面
    // =========================
    if (url.pathname === "/admin") {
      return new Response(getAdminHTML(), {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }

    // =========================
    // 发送 Telegram 消息
    // =========================
    if (url.pathname === "/send") {
      if (request.method !== "POST") {
        return json({
          success: false,
          message: "只允许 POST 请求"
        }, 405);
      }

      try {
        const body = await request.json();

        // -------------------------
        // 后台密码验证
        // -------------------------
        if (!env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Cloudflare 环境变量 ADMIN_PASSWORD 未设置"
          }, 500);
        }

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "后台密码错误"
          }, 401);
        }

        // -------------------------
        // 必填参数
        // -------------------------
        const country = String(body.country || "").trim();
        const add = String(body.add || "").trim();
        const stock = String(body.stock || "").trim();
        const price = String(body.price || "").trim();
        const buyurl = String(body.buyurl || "").trim();
        const image = String(body.image || "").trim();

        if (!country) {
          return json({
            success: false,
            message: "请输入国家/地区"
          }, 400);
        }

        if (!add) {
          return json({
            success: false,
            message: "请输入新增库存"
          }, 400);
        }

        if (!stock) {
          return json({
            success: false,
            message: "请输入剩余库存"
          }, 400);
        }

        if (!price) {
          return json({
            success: false,
            message: "请输入单价"
          }, 400);
        }

        // -------------------------
        // 购买链接验证
        // -------------------------
        if (!buyurl) {
          return json({
            success: false,
            message: "请输入购买链接"
          }, 400);
        }

        let parsedBuyURL;

        try {
          parsedBuyURL = new URL(buyurl);

          if (
            parsedBuyURL.protocol !== "https:" &&
            parsedBuyURL.protocol !== "http:"
          ) {
            throw new Error("invalid protocol");
          }
        } catch {
          return json({
            success: false,
            message: "购买链接格式错误，必须是 http:// 或 https://"
          }, 400);
        }

        // -------------------------
        // Telegram 配置检查
        // -------------------------
        if (!env.BOT_TOKEN) {
          return json({
            success: false,
            message: "BOT_TOKEN 未设置"
          }, 500);
        }

        if (!env.CHANNEL_ID) {
          return json({
            success: false,
            message: "CHANNEL_ID 未设置"
          }, 500);
        }

        // -------------------------
        // 生成 Telegram 文本
        // -------------------------
        const text =
`🟢🟢🟢 库存更新 🟢🟢🟢

${escapeHTML(country)}

📦 添加库存 ${escapeHTML(add)} 个

💰 单价 ¥${escapeHTML(price)}

🟢 剩余库存 ${escapeHTML(stock)} 个`;

        // -------------------------
        // Telegram 按钮
        // -------------------------
        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "🛒 点击购买此商品",
                url: parsedBuyURL.toString()
              }
            ]
          ]
        };

        let telegramResponse;

        // =========================
        // 有图片：sendPhoto
        // =========================
        if (image) {
          try {
            const parsedImageURL = new URL(image);

            if (
              parsedImageURL.protocol !== "https:" &&
              parsedImageURL.protocol !== "http:"
            ) {
              throw new Error("invalid image protocol");
            }

            telegramResponse = await fetch(
              `https://api.telegram.org/bot${env.BOT_TOKEN}/sendPhoto`,
              {
                method: "POST",
                headers: {
                  "content-type": "application/json"
                },
                body: JSON.stringify({
                  chat_id: env.CHANNEL_ID,
                  photo: parsedImageURL.toString(),
                  caption: text,
                  parse_mode: "HTML",
                  reply_markup: replyMarkup
                })
              }
            );
          } catch {
            return json({
              success: false,
              message: "商品图片链接格式错误"
            }, 400);
          }
        }

        // =========================
        // 无图片：sendMessage
        // =========================
        else {
          telegramResponse = await fetch(
            `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                chat_id: env.CHANNEL_ID,
                text,
                parse_mode: "HTML",
                reply_markup: replyMarkup
              })
            }
          );
        }

        // =========================
        // Telegram 返回结果
        // =========================
        const telegramData = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramData.ok) {
          return json({
            success: false,
            message:
              telegramData.description ||
              "Telegram 发送失败",
            telegram: telegramData
          }, 500);
        }

        return json({
          success: true,
          message: "发送成功",
          telegram: telegramData
        });

      } catch (error) {
        return json({
          success: false,
          message: error?.message || "服务器内部错误"
        }, 500);
      }
    }

    return new Response("404 Not Found", {
      status: 404
    });
  }
};


// =====================================================
// 后台 HTML
// =====================================================

function getAdminHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">

<head>
<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
>

<title>TG 库存通知后台</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 20px;
  background: #f5f7fa;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  color: #222;
}

.container {
  max-width: 620px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.subtitle {
  color: #888;
  font-size: 14px;
  margin-bottom: 22px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 7px;
}

input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  outline: none;
  font-size: 15px;
  background: #fff;
}

input:focus {
  border-color: #229ED9;
  box-shadow: 0 0 0 3px rgba(34,158,217,.10);
}

button {
  width: 100%;
  margin-top: 22px;
  padding: 14px;
  border: 0;
  border-radius: 11px;
  background: #229ED9;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.result {
  margin-top: 16px;
  padding: 13px;
  border-radius: 10px;
  display: none;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.success {
  background: #eaf8ef;
  color: #18763a;
}

.error {
  background: #fff0f0;
  color: #c62828;
}

.example {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.footer {
  text-align: center;
  color: #aaa;
  font-size: 12px;
  margin-top: 18px;
}

</style>
</head>


<body>

<div class="container">

<div class="card">

<div class="title">
📦 TG 库存通知后台
</div>

<div class="subtitle">
填写商品库存信息，一键发送到 Telegram 频道
</div>


<label>🔐 后台密码</label>

<input
  id="password"
  type="password"
  placeholder="请输入后台密码"
  autocomplete="current-password"
/>


<label>🌍 国家 / 地区</label>

<input
  id="country"
  placeholder="例如：泰国 +66"
/>


<label>📦 新增库存</label>

<input
  id="add"
  type="text"
  inputmode="numeric"
  placeholder="例如：100"
/>


<label>🟢 当前剩余库存</label>

<input
  id="stock"
  type="text"
  inputmode="numeric"
  placeholder="例如：500"
/>


<label>💰 单价</label>

<input
  id="price"
  type="text"
  inputmode="decimal"
  placeholder="例如：6.9"
/>


<label>🔗 购买链接</label>

<input
  id="buyurl"
  type="url"
  placeholder="https://example.com/buy"
/>

<div class="example">
购买按钮会自动添加到 Telegram 消息底部
</div>


<label>🖼️ 商品图片 URL（可选）</label>

<input
  id="image"
  type="url"
  placeholder="https://example.com/image.jpg"
/>

<div class="example">
填写后会以 Telegram 图片消息发送；不填写则发送纯文字
</div>


<button id="sendButton" onclick="sendMessage()">
🚀 发送库存通知
</button>


<div id="result" class="result"></div>

</div>


<div class="footer">
TG Stock Notify Bot · Cloudflare Workers
</div>

</div>


<script>

async function sendMessage() {

  const button = document.getElementById("sendButton");
  const result = document.getElementById("result");

  const data = {
    password: document.getElementById("password").value.trim(),
    country: document.getElementById("country").value.trim(),
    add: document.getElementById("add").value.trim(),
    stock: document.getElementById("stock").value.trim(),
    price: document.getElementById("price").value.trim(),
    buyurl: document.getElementById("buyurl").value.trim(),
    image: document.getElementById("image").value.trim()
  };

  result.style.display = "none";
  result.className = "result";

  button.disabled = true;
  button.innerText = "⏳ 正在发送...";

  try {

    const response = await fetch("/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();

    result.style.display = "block";

    if (json.success) {

      result.classList.add("success");

      result.innerText =
        "✅ 发送成功\\n\\nTelegram 已收到库存通知。";

    } else {

      result.classList.add("error");

      result.innerText =
        "❌ 发送失败\\n\\n" +
        (json.message || "未知错误");

    }

  } catch (error) {

    result.style.display = "block";
    result.classList.add("error");

    result.innerText =
      "❌ 请求失败\\n\\n" +
      (error.message || "网络错误");

  } finally {

    button.disabled = false;
    button.innerText = "🚀 发送库存通知";

  }
}

</script>

</body>
</html>`;
}


// =====================================================
// JSON 返回
// =====================================================

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
}


// =====================================================
// HTML 转义
// =====================================================

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}