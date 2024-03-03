# Make sure deno is on the system
if command -v deno > /dev/null 2>&1; then
    # Kill deno if it is already running 
    PREV_DENO_PROC_ID=$(pgrep -x "deno")
    if [ -f "/proc/$PREV_DENO_PROC_ID/exe" ]; then
        while [[ ! "$ANS" =~ ^[yn]$ ]]; do
            read -p "Dispenser is already running! Would you like to restart it? (y/n) " ANS

            if [[ ! "$ANS" =~ ^[yn]$ ]]; then
                echo "Invalid input! Please enter a \"y\" for yes or a \"n\" for no."
            fi
        done

        if [ "$ANS" = "y" ]; then
            echo "Killing deno"
            pkill deno
        elif [ "$ANS" = "n" ]; then
            echo "It seems like you were mistaken. The other deno process is $PREV_DENO_PROC_ID. Goodbye!"
            exit 0
        fi
    fi

    LOGS=logs/
    # Make the log directory if it doesn't already exist
    if [ ! -d $LOGS ]; then
        mkdir -p $LOGS
    fi

    echo "Starting deno"
    deno run --allow-read --allow-net --allow-sys src/app.ts > $LOGS/stdlog.txt 2> $LOGS/stderr.txt &
else
    echo "Deno is not installed on your system. Please install it!"
    exit 1
fi
# TODO: If Deno is on the system, try other runtimes