// ロード画面を非表示にする関数
function hideLoadingScreen() {
    document.getElementById('loading').style.display = 'none';
}

let displayedQuizzes = [];

// CSVデータを読み込んでオブジェクトの配列に変換する関数
// CSVデータを読み込んでオブジェクトの配列に変換する関数
function convertCSVtoArray(str){
    var result = [];
    var tmp = str.split("\n");

    // 最初の行（ヘッダー）を除外してループ
    for(var i = 1; i < tmp.length; ++i){
        if (tmp[i].trim() === '') continue; // 空の行は無視する

        var row = tmp[i].split(',');

        // CSVの各行をオブジェクトに変換
        var quiz = {
            question: row[0],
            options: row.slice(1, -1), // 最後の要素（正解のインデックス）を除く
            correct: `radio${i}-${row[row.length - 1]}` // 正解のIDを生成
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
        req.send(null);

        req.onload = function(){
            resolve(convertCSVtoArray(req.responseText));
        };

        req.onerror = function() {
            reject(new Error("CSVのロードに失敗しました"));
        };
    });
}

// CSVデータの読み込みと処理を行う関数
async function loadData() {
    try {
        const allQuizzes = await getCSV();
        const randomQuizzes = pickRandomQuizzes(allQuizzes, 10);
        generateQuizzes(randomQuizzes);
        hideLoadingScreen();
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
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
            <p class="quiz-num"><span class="big">${quizIndex + 1}</span>問目</p>
            <p class="quiz-sentence">${quiz.question}</p>
            <div class="answer-btn-box">
                ${quiz.options.reduce((html, option, optIndex) => {
                    // 新しい行を開始するために、インデックスが偶数の時に開始タグを追加
                    if (optIndex % 2 === 0) html += '<div class="btn-row">';

                    html += `
                        <label>
                            <input type="radio" name="radio${quizIndex + 1}" id="radio${quizIndex + 1}-${optIndex + 1}">
                            <span class="radio-button">${option}</span>
                        </label>
                    `;

                    // 行を終了するために、インデックスが奇数または最後の要素の時に終了タグを追加
                    if (optIndex % 2 === 1 || optIndex === quiz.options.length - 1) html += '</div>';

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
    const resultsContainer = document.getElementById('results');
    const headerHeight = document.querySelector('header').offsetHeight;
    resultsContainer.innerHTML = ''; // 既存の結果をクリア

    function displayResult() {
        if (currentQuiz >= displayedQuizzes.length) {
            return; // すべてのクイズが完了したら終了
        }

        const userAnswer = document.querySelector(`input[name="radio${currentQuiz + 1}"]:checked`);
        const result = document.createElement('div');
        let isCorrect = false;

        if (userAnswer && userAnswer.id === quizzes[currentQuiz].correct) {
            result.textContent = `${currentQuiz + 1}問目: 正解！`;
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
        
            // アニメーションのために一定時間後に不透明度を変更
            setTimeout(() => {
                mark.style.opacity = 1;
            }, 100); // 小さな遅延を追加してCSSのトランジションが適用されるようにする
        }        

        // ヘッダーとビューポートの高さを考慮したスクロール
        const quizCard = document.getElementsByClassName('quiz-card')[currentQuiz];
        const quizCardHeight = quizCard.offsetHeight;
        const position = quizCard.getBoundingClientRect().top + window.pageYOffset - headerHeight - (window.innerHeight - quizCardHeight) / 2;
        window.scrollTo({ top: position, behavior: 'smooth' });

        currentQuiz++;
        setTimeout(displayResult, 3000); // 次の結果を表示するまでの間隔
    }

    displayResult();
}