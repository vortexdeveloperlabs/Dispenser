pkill deno
deno run --allow-read --allow-net --allow-sys app.ts > stdlog.txt 2>stderr.txt &
