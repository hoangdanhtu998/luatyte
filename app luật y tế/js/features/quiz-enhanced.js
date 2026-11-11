/* Quiz nâng cao: Shuffle đáp án, random câu hỏi, ghi điểm cao nhất */
(function() {
  var QUIZ_KEY = 'luatyte-quiz-highscore';

  function shuffleArray(arr) {
    var result = arr.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  function getRandomQuestions(questions, count) {
    var shuffled = shuffleArray(questions);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  function shuffleOptions(question) {
    // Lưu đáp án đúng trước khi shuffle
    var correctAnswer = question.answer;
    var correctText = question.options[correctAnswer];
    
    // Tạo array option với index gốc
    var optionsWithIndex = question.options.map(function(opt, idx) {
      return { text: opt, originalIndex: idx };
    });
    
    // Shuffle
    var shuffled = shuffleArray(optionsWithIndex);
    
    // Tìm lại index của đáp án đúng sau shuffle
    var newCorrectIndex = shuffled.findIndex(function(o) { return o.originalIndex === correctAnswer; });
    
    return {
      options: shuffled.map(function(o) { return o.text; }),
      answer: newCorrectIndex
    };
  }

  function getHighScore(questionId) {
    try {
      var scores = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
      return scores[questionId] || 0;
    } catch(e) { return 0; }
  }

  function setHighScore(questionId, score) {
    try {
      var scores = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
      if (score > (scores[questionId] || 0)) {
        scores[questionId] = score;
        localStorage.setItem(QUIZ_KEY, JSON.stringify(scores));
      }
    } catch(e) {}
  }

  function getNextRandomQuestion(questions, wrongAnswers, correctStreaks) {
    // Tính trọng số cho mỗi câu dựa trên số lần sai
    var weights = questions.map(function(q, i) {
      var streak = correctStreaks[q.id] || 0;
      var wrongCount = wrongAnswers[q.id] || 0;
      // Câu hay sai được chọn nhiều hơn
      return wrongCount > 0 ? wrongCount * 10 + (5 - Math.min(streak, 5)) : 1;
    });
    
    var totalWeight = weights.reduce(function(a, b) { return a + b; }, 0);
    var random = Math.random() * totalWeight;
    var cumulative = 0;
    
    for (var i = 0; i < questions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return questions[i];
    }
    return questions[questions.length - 1];
  }

  window.LYTQuizEnhanced = {
    shuffleArray, getRandomQuestions, shuffleOptions,
    getHighScore, setHighScore, getNextRandomQuestion
  };
})();
