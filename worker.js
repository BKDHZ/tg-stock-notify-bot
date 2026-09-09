export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("TG Stock Bot Online");
    }

    if (url.pathname === "/admin") {
      return new Response(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>库存通知后台</title>
<style>
body{max-width:600px;margin:auto;padding:20px;font-family:sans-serif}
input{width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px}
button{width:100%;padding:14px;background:#229ED9;color:#fff;border:0;border-radius:8px}
</style></head><body>
<h2>📦 库存通知后台</h2>
<input id="password" type="password" placeholder="后台密码">
<input id="country" placeholder="国家，例如 泰国 +66">
<input id="add" placeholder="新增库存">
<input id="stock" placeholder="当前库存">
<input id="price" placeholder="单价">
<input id="buyurl" placeholder="购买链接">
<button onclick="sendMsg()">发送通知</button>
<script>
async function sendMsg(){
const data={
password:password.value,country:country.value,add:add.value,
stock:stock.value,price:price.value,buyurl:buyurl.value
};
const r=await fetch('/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
alert(await r.text());
}
</script></body></html>`,{
        headers:{"content-type":"text/html;charset=utf-8"}
      });
    }

    if (url.pathname === "/send") {
      const body = await request.json();

      if (body.password !== env.ADMIN_PASSWORD) {
        return new Response("密码错误");
      }

      const text = `🟢🟢🟢库存更新🟢🟢🟢

【${body.country}】

📦 添加库存 ${body.add} 个

💰 单价 ¥${body.price}

🟢 剩余库存 ${body.stock} 个`;

      const tg = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            chat_id: env.CHANNEL_ID,
            text,
            reply_markup:{
              inline_keyboard:[[{text:"🛒 点击购买此商品",url:body.buyurl}]]
            }
          })
        }
      );

      return new Response(tg.ok ? "发送成功" : "发送失败");
    }

    return new Response("404");
  }
}