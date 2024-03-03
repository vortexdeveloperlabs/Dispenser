pkill deno
deno run --allow-read --allow-net --allow-sys src/app.ts > stdlog.txt 2>stderr.txt &
