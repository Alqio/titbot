
'use strict';

const TeleBot = require('telebot'),
    config = require("./config"),
    token = config.botToken;
const morse = require('morse');
const bot = new TeleBot(token);

const fs = require('fs');

const shortFile = "lyhyt.mp3";
const longFile = "pitka.mp3";
const breakFile = "break.mp3";


bot.on('/reverse', (msg) => {
    console.log(msg);
    const text = msg.text.split(" ")[1].split("").reverse().join("");

    bot.sendMessage(msg.chat.id, text);
});

const generateArray = (str) => {
    const ar = [];
    const pieces = str.split(" ");

    for (let i = 0; i < pieces.length; i++) {
        const s = pieces[i];
        if (s === ".......") {
            ar.push(breakFile);
        }

        for (let j = 0; j < s.length; j++) {
            const char = s[j];
            if (char === ".") {
                ar.push(shortFile);
            } else {
                ar.push(longFile);
            }
        }

    }
    return ar;
};

bot.on('/tsirp', (msg) => {

    console.log(msg);

    const text = msg.text.replace('/tsirp ', '')
    const encoded = morse.encode(text);

    const files = generateArray(encoded);
    console.log("files:", files);



    let stream;

    const fname = "bird-speech.mp3";

    let all = fs.createWriteStream(fname);

    let currentfile = '';

    main();

    function main() {
        if (!files.length) {
            all.end("Done");
            console.log("all done");
            return;
        }
        currentfile = files.shift();
        stream = fs.createReadStream(currentfile);
        stream.pipe(all, {end: false});
        stream.on("end", function() {
            //console.log(currentfile + ' appended');
            main();
        });
    }

    console.log("All files appended");
    setTimeout(() => {
        bot.sendMessage(msg.chat.id, encoded);
        bot.sendAudio(msg.chat.id, fname);
        console.log("Sent bird speech!");
    }, 500 + files.length/20 * 100);


});


bot.start();
