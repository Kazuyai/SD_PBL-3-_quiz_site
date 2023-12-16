// クイズのデータ
const quizzes = [
    {
        question: "ここに問題1を書く",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct: "radio1-1"
    },
    {
        question: "ここに問題2を書く",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct: "radio1-1"
    },
    {
        question: "ここに問題3を書く",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct: "radio1-1"
    }
    // 同様に他の問題を追加
];

function generateQuizzes() {
    const quizBox = document.querySelector('.quiz-box');

    quizzes.forEach((quiz, quizIndex) => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
            <p class="quiz-num"><span class="big">${quizIndex + 1}</span>問目</p>
            <p class="quiz-sentence">${quiz.question}</p>
            <div class="answer-btn-box">
                ${quiz.options.map((option, optIndex) => `
                    <div class="btn-row">
                        <label>
                            <input type="radio" name="radio${quizIndex + 1}" id="radio${quizIndex + 1}-${optIndex + 1}">
                            <span class="radio-button">${option}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        quizBox.appendChild(quizCard);
    });
}

document.addEventListener('DOMContentLoaded', generateQuizzes);

function showResults() {
    let currentQuiz = 0;
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // 既存の結果をクリア

    function displayResult() {
        if (currentQuiz >= quizzes.length) {
            return; // すべてのクイズが完了したら終了
        }

        const userAnswer = document.querySelector(`input[name="radio${currentQuiz + 1}"]:checked`);
        const result = document.createElement('div');

        if (userAnswer && userAnswer.id === quizzes[currentQuiz].correct) {
            result.textContent = `${currentQuiz + 1}問目: 正解！`;
        } else {
            result.textContent = `${currentQuiz + 1}問目: 不正解`;
        }

        resultsContainer.appendChild(result);

        // 次のクイズにスクロール
        document.getElementsByClassName('quiz-card')[currentQuiz].scrollIntoView({ behavior: 'smooth' });

        currentQuiz++;
        setTimeout(displayResult, 3000); // 次の結果を表示するまでの間隔
    }

    displayResult();
}