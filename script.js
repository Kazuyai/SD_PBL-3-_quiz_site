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
        if (window.location.search.includes('reload')) {
            const firstQuiz = document.getElementById('first-question');
            const firstQuizHeight = firstQuiz.offsetHeight;
            const position = firstQuiz.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight - firstQuizHeight) / 2;
            window.scrollTo({ top: position, behavior: 'smooth' });
        }
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
        if (quizIndex === 0) {
            quizCard.id = 'first-question';
        }
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
        const correctOption = displayedQuizzes[currentQuiz].options[parseInt(displayedQuizzes[currentQuiz].correct.split('-')[1]) - 1];
        const questionText = displayedQuizzes[currentQuiz].question;
        let isCorrect = false;

        const result = document.createElement('div');
        if (userAnswer && userAnswer.id === displayedQuizzes[currentQuiz].correct) {
            result.innerHTML = `<span>${currentQuiz + 1}問目: <span class="red">正解！</span> </span>`;
            correctAnswers++;
            isCorrect = true;
        } else {
            result.innerHTML = `<span>${currentQuiz + 1}問目: <span class="blue">不正解</span> </span>`;
        }

        // 正解の詳細を表示するリンクを追加
        const detailLink = document.createElement('a');
        detailLink.href = '#';
        detailLink.textContent = '正解を確認する';
        detailLink.className = 'show-answer';
        detailLink.dataset.quizIndex = currentQuiz;
        result.appendChild(detailLink);

        resultsContainer.appendChild(result);

        // 正解の詳細カードを作成
        const correctAnswerCard = document.createElement('div');
        correctAnswerCard.className = 'correct-answer-card hidden';
        correctAnswerCard.innerHTML = `
            <p><span>正解：</span><br>${correctOption}</p>
            <p><span>問題：</span><br>${questionText}</p>
        `;
        resultsContainer.appendChild(correctAnswerCard);

        // 正解の詳細リンクのクリックイベント
        detailLink.addEventListener('click', function(e) {
            e.preventDefault();
            correctAnswerCard.classList.toggle('hidden');
        });

        // 選択した選択肢の上に〇または✕の画像を表示
        if (userAnswer) {
            const mark = document.createElement('img');
            mark.src = isCorrect ? './Images/maru.png' : './Images/batu.png';
            mark.className = isCorrect ? 'correct-mark' : 'incorrect-mark';
            userAnswer.parentNode.appendChild(mark);

            setTimeout(() => {
                mark.style.opacity = 1;
            }, 100);
        } else {
            const mark = document.createElement('img');
            mark.src = './Images/batu.png';
            mark.className = 'incorrect-mark not-answered';
            const quizSentence = document.getElementsByClassName('quiz-card')[currentQuiz].getElementsByClassName('quiz-sentence')[0];
            quizSentence.appendChild(mark);

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
            setTimeout(scrollToResults, 3000);
            $('.sns-box').css('display','flex');
            $('#results').css('display','block');
            $('.try-again').show();
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
            let twitterUrl = `https://twitter.com/intent/tweet?text=${text}%0a%23SD_PBL3%20%23フェイクニュースクイズ%0a&url=https://kazuyai.github.io/SD_PBL-3-_quiz_site/`;
            document.getElementById('twitter-share-link').setAttribute('href', twitterUrl);
            let lineUrl = `http://line.me/R/msg/text/?${text} https://kazuyai.github.io/SD_PBL-3-_quiz_site/`;
            document.getElementById('line-share-link').setAttribute('href', lineUrl);

            return;
        }

        const radioButtons = document.querySelectorAll('.quiz-box input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.disabled = true;
        });
        $('.sns-box').css('display','none');
        $('.to-grade').hide();
        setTimeout(displayResult, 3000);
    }

    function scrollToResults() {
        const results = document.getElementById('results');
        const resultsHeight = results.offsetHeight;
        const resultsPosition = results.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight - resultsHeight) / 2;
        window.scrollTo({ top: resultsPosition, behavior: 'smooth' });
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
    $('.try-again').click(function() {
        window.location.href = window.location.pathname + '?reload#first-question';
    });
});
