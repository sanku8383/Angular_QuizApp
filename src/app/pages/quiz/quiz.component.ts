import { Component, inject } from '@angular/core';
import { TestService } from '../../services/test.service';
import { Question, Quiz, QuizResult } from '../../Types';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent {
  testService = inject(TestService);
  router = inject(Router);
  questions: Question[] = [];
  quizInfo!: Quiz;
  quizResult!: QuizResult;
  currentQuestionNo: number = 0;
  ngOnInit() {
    this.quizResult = this.testService.quizResult;
    if (!this.quizResult) {
      this.router.navigateByUrl('/');
      return;
    }
    this.testService.getQuestions().subscribe((results) => {
      this.questions = results;
    });
    this.testService.getQuizById(this.quizResult.quizId).subscribe((result) => {
      this.quizInfo = result;
    });
  }
  get currentQuestion() {
    let questionId = this.quizInfo.questions[this.currentQuestionNo];
    return this.questions.find((x) => x.id == questionId);
  }

  currentSelectedOptionId: string = '';
  next() {
    this.quizResult.response?.push({
      questionId: this.currentQuestion!.id,
      answerOptionId: this.currentSelectedOptionId,
    });
    this.currentQuestionNo++;
    this.currentSelectedOptionId = '';
  }
  submit() {
    this.next();
    this.calculateResult();
    this.testService.updateQuizResult(this.quizResult.id!,this.quizResult).subscribe();
    this.router.navigateByUrl('quiz-score');
  }
  calculateResult() {
    let score = 0;
    let correct = 0;
    let inCorrect = 0;
    let unAttempt = 0;
    let percentage = 0;
    let totalMark = 0;
    console.log(this.quizResult);
    this.quizResult.response?.forEach((response) => {
      let questionId = response.questionId;
      let selectedOptionId = response.answerOptionId;
      let question = this.questions.find((x) => x.id == questionId);
      let correctOption = question?.options.find((x) => x.isCorrect == true);
      totalMark += question!.marks;
      if (!selectedOptionId) {
        unAttempt++;
      } else if (selectedOptionId == correctOption?.id) {
        correct++;
        score += question!.marks;
      } else {
        inCorrect++;
        score -= question!.negativeMarks;
      }
    });
    percentage = Math.round((score / totalMark) * 100);
    this.quizResult.correct = correct;
    this.quizResult.inCorrect = inCorrect;
    this.quizResult.unAttempt = unAttempt;
    this.quizResult.score = score;
    this.quizResult.percentage = percentage;
  }
}