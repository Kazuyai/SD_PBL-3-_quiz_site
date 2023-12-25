$(window).on('load',function(){
    $("#splash").delay(1500).fadeOut('slow');
    $("#splash_logo").delay(1200).fadeOut('slow');
});

let displayedQuizzes = [];

// CSVデータを読み込んでオブジェクトの配列に変換する関数
function convertCSVtoArray(str){
    var result = [];
    var tmp = str.replace(/\r/g, '').split("\n");

    // 最初の行（ヘッダー）を除外してループ
    for(var i = 1; i < tmp.length; ++i){
        if (tmp[i].trim() === '') continue; // 空の行は無視する

        var row = tmp[i].split(',');

        // CSVの各行をオブジェクトに変換
        var quiz = {
            question: row[0],
            options: row.slice(1, -1), // 最後の要素（正解のインデックス）を除く
            correct: row[row.length - 1] // 正解のIDを生成
        };
        result.push(quiz);
    }
    return result;
}

// CSVファイルを読み込む関数
function getCSV(){
    return new Promise(function(resolve, reject){
        var req = new XMLHttpRequest();
        req.open("get", "quizzes.csv", true);
        req.overrideMimeType('text/plain; charset=Shift-jis'); // UTF-8として解釈するように指定
        req.send(null);

        req.onload = function(){
            if (req.status === 200) {
                resolve(convertCSVtoArray(req.responseText));
            } else {
                reject(new Error("CSVファイルの読み込みに失敗しました: " + req.status));
            }
        };

        req.onerror = function() {
            reject(new Error("CSVファイルの読み込み中にエラーが発生しました"));
        };
    });
}

// CSVデータの読み込みと処理を行う関数
async function loadData() {
    try {
        const allQuizzes = await getCSV();
        const randomQuizzes = pickRandomQuizzes(allQuizzes, 10);
        generateQuizzes(randomQuizzes);
    } catch (error) {
        console.error(error.message);
    }
}

// ランダムにクイズを選ぶ関数
function pickRandomQuizzes(quizzes, count) {
    // 配列をシャッフル
    const shuffled = quizzes.sort(() => 0.5 - Math.random());
    // 最初のcount要素を返す
    return shuffled.slice(0, count);
}

function generateQuizzes(quizzes) {
    const quizBox = document.querySelector('.quiz-box');

    displayedQuizzes = quizzes;

    quizzes.forEach((quiz, quizIndex) => {
        quiz.correct = `radio${quizIndex + 1}-${quiz.correct}`; // 正解のIDを生成
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card fadein';
        quizCard.innerHTML = `
            <p class="quiz-num"><span class="big">${quizIndex + 1}</span>問目</p>
            <p class="quiz-sentence">${quiz.question}</p>
            <div class="answer-btn-box">
                ${quiz.options.reduce((html, option, optIndex) => {
                    html += `
                        <label>
                            <input type="radio" name="radio${quizIndex + 1}" id="radio${quizIndex + 1}-${optIndex + 1}">
                            <span class="radio-button">${option}</span>
                        </label>
                    `;
                    return html;
                }, '')}
            </div>
        `;
        quizBox.appendChild(quizCard);
    });
}

document.addEventListener('DOMContentLoaded', loadData);

function showResults() {
    let currentQuiz = 0;
    let correctAnswers = 0;
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // 既存の結果をクリア

    function displayResult() {
        const userAnswer = document.querySelector(`input[name="radio${currentQuiz + 1}"]:checked`);
        const result = document.createElement('div');
        let isCorrect = false;
        if (userAnswer && userAnswer.id == displayedQuizzes[currentQuiz].correct) {
            result.textContent = `${currentQuiz + 1}問目: 正解！`;
            correctAnswers++;
            isCorrect = true;
        } else {
            result.textContent = `${currentQuiz + 1}問目: 不正解`;
        }

        resultsContainer.appendChild(result);

        // 選択した選択肢の上に〇または✕を表示
        if (userAnswer) {
            const mark = document.createElement('span');
            mark.textContent = isCorrect ? '〇' : '✕';
            mark.className = isCorrect ? 'correct-mark' : 'incorrect-mark';
            userAnswer.parentNode.appendChild(mark);
        
            setTimeout(() => {
                mark.style.opacity = 1;
            }, 100);
        }        

        // ヘッダーとビューポートの高さを考慮したスクロール
        const quizCard = document.getElementsByClassName('quiz-card')[currentQuiz];
        const quizCardHeight = quizCard.offsetHeight;
        const position = quizCard.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight - quizCardHeight) / 2;
        window.scrollTo({ top: position, behavior: 'smooth' });

        currentQuiz++;
        if (currentQuiz >= displayedQuizzes.length) {
            $('.sns-box').css('display','flex');
            displayScore();
            let correctAnswerRate = Math.round((correctAnswers / displayedQuizzes.length) * 100);
            let text;
            if(correctAnswerRate == 0) {
                text = encodeURIComponent(`フェイクニュースクイズの点数は${correctAnswerRate}点です。\n残念…`);    
            } else if(correctAnswerRate == 100) {
                text = encodeURIComponent(`フェイクニュースクイズの点数は${correctAnswerRate}点です。\nおめでとう！`);    
            } else {
                text = encodeURIComponent(`フェイクニュースクイズの点数は${correctAnswerRate}点です。\n`);    
            }
            let twitterUrl = `https://twitter.com/intent/tweet?text=${text}&hashtags=SD_PBL3&url=https://kazuyai.github.io/SD_PBL-3-_quiz_site/`;
            document.getElementById('twitter-share-link').setAttribute('href', twitterUrl);
            let lineUrl = `http://line.me/R/msg/text/?${text} https://kazuyai.github.io/SD_PBL-3-_quiz_site/`;
            document.getElementById('line-share-link').setAttribute('href', lineUrl);

            return;
        }

        $('.sns-box').css('display','none');
        setTimeout(displayResult, 3000);
    }

    function displayScore() {
        let scoreText = `あなたのスコア: ${correctAnswers * 100 / displayedQuizzes.length}点`;
        let scoreDisplay = document.createElement('div');
        scoreDisplay.textContent = scoreText;
        scoreDisplay.className = 'quiz-score';
        resultsContainer.appendChild(scoreDisplay);
    }

    displayResult();
}

$(document).ready(function(){
    //デバイス判定（タッチが有効か否か）
    var isTouchDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    //デバイス判定によるイベントの決定
    var eventType = (isTouchDevice) ? 'touchend' : 'click';
    $('.to-grade').on(eventType, showResults);
});
