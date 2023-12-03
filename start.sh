nohup mongod >/dev/null 2>&1
pkill deno
deno run --allow-read --allow-net app.ts
